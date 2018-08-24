import CompilerUtil from './CompilerUtil';
// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*';
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

let IS_REGEX_CAPTURING_BROKEN = false;
'x'.replace(/x(.)?/g, (m, g) => {
    IS_REGEX_CAPTURING_BROKEN = g === '';
    return '';
});

// Special Elements (can contain anything)
const reCache = {};

const decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t'
};
const encodedAttr = /&(?:lt|gt|quot|amp);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;

// #5992
const isIgnoreNewlineTag = CompilerUtil.makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = (tag: any, html: any) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n';


export default class HtmlParser {

    isPlainTextElement = CompilerUtil.makeMap('script,style,textarea', true);
    options: CompilerOptions;
    html: string;
    index = 0;
    stack: any[] = [];
    lastTag: any;
    expectHTML: boolean;
    isUnaryTag: any;
    canBeLeftOpenTag: any;

    constructor(html: string, options: CompilerOptions) {
        this.html = html;
        this.options = options;
    }

    parseHTML() {
        this.expectHTML = this.options.expectHTML ? this.options.expectHTML : false;
        this.isUnaryTag = this.options.isUnaryTag || CompilerUtil.no;
        this.canBeLeftOpenTag = this.options.canBeLeftOpenTag || CompilerUtil.no;

        let last;

        while (this.html) {
            last = this.html;
            // Make sure we're not in a plaintext content element like script/style
            if (!this.lastTag || !this.isPlainTextElement(this.lastTag)) {
                let textEnd = this.html.indexOf('<');
                if (textEnd === 0) {
                    // Comment:
                    if (comment.test(this.html)) {
                        const commentEnd = this.html.indexOf('-->');

                        if (commentEnd >= 0) {
                            if (this.options.shouldKeepComment) {
                                this.options.comment(this.html.substring(4, commentEnd));
                            }
                            this.advance(commentEnd + 3);
                            continue;
                        }
                    }
                    if (conditionalComment.test(this.html)) {
                        const conditionalEnd = this.html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            this.advance(conditionalEnd + 2);
                            continue;
                        }
                    }
                    if (conditionalComment.test(this.html)) {
                        const conditionalEnd = this.html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            this.advance(conditionalEnd + 2);
                            continue;
                        }
                    }

                    // Doctype:
                    const doctypeMatch = this.html.match(doctype);
                    if (doctypeMatch) {
                        this.advance(doctypeMatch[0].length);
                        continue;
                    }

                    // End tag:
                    const endTagMatch = this.html.match(endTag);
                    if (endTagMatch) {
                        const curIndex = this.index;
                        this.advance(endTagMatch[0].length);
                        this.parseEndTag(endTagMatch[1], curIndex, this.index);
                        continue;
                    }

                    // Start tag:
                    const startTagMatch = this.parseStartTag();
                    if (startTagMatch) {
                        this.handleStartTag(startTagMatch);
                        if (shouldIgnoreFirstNewline(this.lastTag, this.html)) {
                            this.advance(1);
                        }
                        continue;
                    }
                }
                let text, rest, next;
                if (textEnd >= 0) {
                    rest = this.html.slice(textEnd);
                    while (
                        !endTag.test(rest) &&
                        !startTagOpen.test(rest) &&
                        !comment.test(rest) &&
                        !conditionalComment.test(rest)
                    ) {
                        // < in plain text, be forgiving and treat it as text
                        next = rest.indexOf('<', 1);
                        if (next < 0) break;
                        textEnd += next;
                        rest = this.html.slice(textEnd);
                    }
                    text = this.html.substring(0, textEnd);
                    this.advance(textEnd);
                }

                if (textEnd < 0) {
                    text = this.html;
                    this.html = '';
                }

                if (this.options.chars && text) {
                    this.options.chars(text);
                }
            } else {
                let endTagLength = 0;
                const stackedTag = this.lastTag.toLowerCase();
                const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
                const rest = this.html.replace(reStackedTag, (all, text, endTag) => {
                    endTagLength = endTag.length;
                    if (!this.isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                        text = text.replace(/<!\--([\s\S]*?)-->/g, '$1').replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                    }
                    if (shouldIgnoreFirstNewline(stackedTag, text)) {
                        text = text.slice(1);
                    }
                    if (this.options.chars) {
                        this.options.chars(text);
                    }
                    return '';
                })
                this.index += this.html.length - rest.length;
                this.html = rest;
                this.parseEndTag(stackedTag, this.index - endTagLength, this.index);
            }
            if (this.html === last) {
                this.options.chars && this.options.chars(this.html)
                if (process.env.NODE_ENV !== 'production' && !this.stack.length && this.options.warn) {
                    this.options.warn(`Mal-formatted tag at end of template: "${this.html}"`)
                }
                break
            }
        }
        // Clean up any remaining tags
        this.parseEndTag();
    }

    private decodeAttr(value: any, shouldDecodeNewlines: any) {
        const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
        return value.replace(re, (match: any) => decodingMap[match])
    }

    private advance(n: number) {
        this.index += n;
        this.html = this.html.substring(n)
    }

    private parseStartTag() {
        const start = this.html.match(startTagOpen);
        if (start) {
            const match: any = {
                tagName: start[1],
                attrs: [],
                start: this.index
            }
            this.advance(start[0].length)
            let end, attr;
            while (!(end = this.html.match(startTagClose)) && (attr = this.html.match(attribute))) {
                this.advance(attr[0].length);
                match.attrs.push(attr);
            }
            if (end) {
                match.unarySlash = end[1];
                this.advance(end[0].length);
                match.end = this.index;
                return match;
            }
        }
    }

    private handleStartTag(match: any) {
        const tagName = match.tagName;
        const unarySlash = match.unarySlash;

        if (this.expectHTML) {
            if (this.lastTag === 'p' && this.options.isNonPhrasingTag(tagName)) {
                this.parseEndTag(this.lastTag);
            }
            if (this.canBeLeftOpenTag(tagName) && this.lastTag === tagName) {
                this.parseEndTag(tagName);
            }
        }

        const unary = this.isUnaryTag(tagName) || !!unarySlash;

        const l = match.attrs.length;
        const attrs = new Array(l);
        for (let i = 0; i < l; i++) {
            const args = match.attrs[i];
            // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
            if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                if (args[3] === '') { delete args[3]; }
                if (args[4] === '') { delete args[4]; }
                if (args[5] === '') { delete args[5]; }
            }
            const value = args[3] || args[4] || args[5] || '';
            const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
                ? this.options.shouldDecodeNewlinesForHref
                : this.options.shouldDecodeNewlines;
            attrs[i] = {
                name: args[1],
                value: this.decodeAttr(value, shouldDecodeNewlines)
            };
        }

        if (!unary) {
            this.stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
            this.lastTag = tagName;
        }

        if (this.options.start) {
            this.options.start(tagName, attrs, unary, match.start, match.end);
        }
    }

    private parseEndTag(tagName?: string, start?: any, end?: any) {
        let pos, lowerCasedTagName;
        if (start == null) start = this.index;
        if (end == null) end = this.index;

        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase();
        }

        // Find the closest opened tag of the same type
        if (tagName) {
            for (pos = this.stack.length - 1; pos >= 0; pos--) {
                if (this.stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break;
                }
            }
        } else {
            // If no tag name is provided, clean shop
            pos = 0;
        }

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (let i = this.stack.length - 1; i >= pos; i--) {
                if (process.env.NODE_ENV !== 'production' && (i > pos || !tagName) && this.options.warn) {
                    this.options.warn(`tag <${this.stack[i].tag}> has no matching end tag.`);
                }
                if (this.options.end) {
                    this.options.end(this.stack[i].tag, start, end);
                }
            }

            // Remove the open elements from the stack
            this.stack.length = pos;
            this.lastTag = pos && this.stack[pos - 1].tag;
        } else if (lowerCasedTagName === 'br') {
            if (this.options.start) {
                this.options.start(tagName, [], true, start, end);
            }
        } else if (lowerCasedTagName === 'p') {
            if (this.options.start) {
                this.options.start(tagName, [], false, start, end);
            }
            if (this.options.end) {
                this.options.end(tagName, start, end);
            }
        }
    }
}