// export default class ParseHtml {

//     private decoder: any;

//     // Browser environment sniffing
//     private inBrowser =
//     typeof window !== 'undefined' &&
//     Object.prototype.toString.call(window) !== '[object Object]';

//     private UA:any = this.inBrowser && window.navigator.userAgent.toLowerCase();
//     private isIE = this.UA && /msie|trident/.test(this.UA);

//     private cached(fn: any) {
//         var cache = Object.create(null);
//         return (str: any) => {
//             var hit = cache[str];
//             return hit || (cache[str] = fn.call(this,str));
//         }
//     }

//     private decode(html: string) {
//         this.decoder = this.decoder || document.createElement('div');
//         this.decoder.innerHTML = html;
//         return this.decoder.textContent;
//     }

//     private dirRE = /^v-|^@|^:/;
//     private forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
//     private forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;
//     private stripParensRE = /^\(|\)$/g;
//     private bindRE = /^:|^v-bind:/;
//     private onRE = /^@|^v-on:/;
//     private argRE = /:(.*)$/;
//     private modifierRE = /\.[^.]+/g;

//     private decodeHTMLCached = this.cached(this.decode);

    
//     private platformGetTagNamespace: any;
//     private platformMustUseProp: any;
//     private platformIsPreTag: any;
//     private preTransforms: any;
//     private transforms: any;
//     private postTransforms: any;
//     private delimiters: any;

//     private ncname = '[a-zA-Z_][\\w\\-\\.]*';
//     private qnameCapture = '((?:' + this.ncname + '\\:)?' + this.ncname + ')';
//     private startTagOpen = new RegExp('^<' + this.qnameCapture);

//     private isScriptOrStyle = this.makeMap('script,style', true);

//     private comment = /^<!--/;
//     private conditionalComment = /^<!\[/;

//     private doctype = /^<!DOCTYPE [^>]+>/i;

//     private startTagClose = /^\s*(\/?)>/;
//     private endTag = new RegExp('^<\\/' + this.qnameCapture + '[^>]*>');

//     private reCache = {};

//     private singleAttrIdentifier = /([^\s"'<>/=]+)/;
//     private singleAttrAssign = /(?:=)/;
//     private singleAttrValues = [
//       // attr value double quotes
//       /"([^"]*)"+/.source,
//       // attr value, single quotes
//       /'([^']*)'+/.source,
//       // attr value, no quotes
//       /([^\s"'=<>`]+)/.source
//     ];

//     private attribute = new RegExp(
//         '^\\s*' + this.singleAttrIdentifier.source +
//         '(?:\\s*(' + this.singleAttrAssign.source + ')' +
//         '\\s*(?:' + this.singleAttrValues.join('|') + '))?'
//     );

//     private IS_REGEX_CAPTURING_BROKEN = false;

//     private do_IS_REGEX_CAPTURING_BROKEN() {
//         'x'.replace(/x(.)?/g, (m: string, g: any):string => {
//             this.IS_REGEX_CAPTURING_BROKEN = g === '';
//             return '';
//         });
//     }

//     private hasLang(attr: any) { 
//         return attr.name === 'lang' && attr.value !== 'html'; 
//     }

//     private no(): boolean {
//         return false;
//     }

//     private isSpecialTag(tag: any, isSFC: any, stack: any) {
//         if (this.isScriptOrStyle(tag)) {
//             return true
//         }
//         if (isSFC && stack.length === 1) {
//             // top-level template that has no pre-processor
//             if (tag === 'template' && !stack[0].attrs.some(this.hasLang)) {
//                 return false;
//             } else {
//                 return true;
//             }
//         }
//         return false;
//     }

//     private makeMap(keys: string,expectsLowerCase?: boolean){
//         var _map = {};
//         for(var i=0;i<keys.length;i++){
//             _map[keys[i]] = true;
//         }
//         return expectsLowerCase? function(val: any){return _map[val.toLowerCase()]}: function(val: any){return _map[val]}
//     }

//     private isNonPhrasingTag = this.makeMap(
//         'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
//         'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
//         'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
//         'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
//         'title,tr,track'
//     );

//     private canBeLeftOpenTag = this.makeMap(
//         'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
//     );

//     private ltRE = /&lt;/g;
//     private gtRE = /&gt;/g;
//     private nlRE = /&#10;/g;
//     private ampRE = /&amp;/g;
//     private quoteRE = /&quot;/g;

//     private decodeAttr(value: any, shouldDecodeNewlines: any) {
//         if (shouldDecodeNewlines) {
//             value = value.replace(this.nlRE, '\n');
//         }
//         return value.replace(this.ltRE, '<')
//             .replace(this.gtRE, '>')
//             .replace(this.ampRE, '&')
//             .replace(this.quoteRE, '"');
//     }

//     private parseHtml(html: string, options: any) {
//         let _this = this;
//         this.do_IS_REGEX_CAPTURING_BROKEN();
//         let stack: any = [];
//         let expectHTML = options.expectHTML;
//         let isUnaryTag$$1 = options.isUnaryTag || this.no;
//         let index = 0;
//         let last;
//         let lastTag: string = '';
//         while (html) {
//             last = html;
//             // Make sure we're not in a script or style element
//             if (lastTag == '' || !this.isSpecialTag(lastTag, options.sfc, stack)) {
//                 let textEnd = html.indexOf('<');
//                 if (textEnd === 0) {
//                     // Comment:
//                     if (this.comment.test(html)) {
//                         let commentEnd = html.indexOf('-->');

//                         if (commentEnd >= 0) {
//                             advance(commentEnd + 3);
//                             continue
//                         }
//                     }
//                     if (this.conditionalComment.test(html)) {
//                         let conditionalEnd = html.indexOf(']>');

//                         if (conditionalEnd >= 0) {
//                             advance(conditionalEnd + 2);
//                             continue
//                         }
//                     }
//                     let doctypeMatch = html.match(this.doctype);
//                     if (doctypeMatch) {
//                         advance(doctypeMatch[0].length);
//                         continue
//                     }

//                     // End tag:
//                     let endTagMatch = html.match(this.endTag);
//                     if (endTagMatch) {
//                         let curIndex = index;
//                         advance(endTagMatch[0].length);
//                         parseEndTag(endTagMatch[0], endTagMatch[1], curIndex, index);
//                         continue
//                     }
//                     let startTagMatch = parseStartTag();
//                     if (startTagMatch) {
//                         handleStartTag(startTagMatch);
//                         continue
//                     }
//                 }
//                 let text;
//                 let rest$1;
//                 let next;
//                 if (textEnd > 0) {
//                     rest$1 = html.slice(textEnd);
//                     while (
//                         !this.endTag.test(rest$1) &&
//                         !this.startTagOpen.test(rest$1) &&
//                         !this.comment.test(rest$1) &&
//                         !this.conditionalComment.test(rest$1)
//                     ) {
//                         // < in plain text, be forgiving and treat it as text
//                         next = rest$1.indexOf('<', 1);
//                         if (next < 0) { break }
//                         textEnd += next;
//                         rest$1 = html.slice(textEnd);
//                     }
//                     text = html.substring(0, textEnd);
//                     advance(textEnd);
//                 }

//                 if (textEnd < 0) {
//                     text = html;
//                     html = '';
//                 }

//                 if (options.chars && text) {
//                     options.chars(text);
//                 }
//             } else {
//                 var stackedTag = lastTag.toLowerCase();
//                 var reStackedTag = this.reCache[stackedTag] || (this.reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
//                 var endTagLength = 0;
//                 var rest = html.replace(reStackedTag, (all, text, endTag) => {
//                     endTagLength = endTag.length;
//                     if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
//                         text = text
//                             .replace(/<!--([\s\S]*?)-->/g, '$1')
//                             .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
//                     }
//                     if (options.chars) {
//                         options.chars(text);
//                     }
//                     return '';
//                 });
//                 index += html.length - rest.length;
//                 html = rest;
//                 parseEndTag('</' + stackedTag + '>', stackedTag, index - endTagLength, index);
//             }

//             if (html === last && options.chars) {
//                 options.chars(html);
//                 break
//             }
//         }
//         // Clean up any remaining tags
//         parseEndTag();

//         function advance(n: any) {
//             index += n;
//             html = html.substring(n);
//         }

//         function parseStartTag() {
//             var start = html.match(_this.startTagOpen);
//             if (start) {
//                 let match:any = {
//                     tagName: start[1],
//                     attrs: [],
//                     start: index
//                 };
//                 advance(start[0].length);
//                 let end;
//                 let attr;
//                 while (!(end = html.match(_this.startTagClose)) && (attr = html.match(_this.attribute))) {
//                     advance(attr[0].length);
//                     match.attrs.push(attr);
//                 }
//                 if (end) {
//                     match.unarySlash = end[1];
//                     advance(end[0].length);
//                     match.end = index;
//                     return match
//                 }
//             }
//         }

//         function handleStartTag(match: any) {
//             var tagName = match.tagName;
//             var unarySlash = match.unarySlash;

//             if (expectHTML) {
//                 if (lastTag === 'p' && _this.isNonPhrasingTag(tagName)) {
//                     parseEndTag('', lastTag);
//                 }
//                 if (_this.canBeLeftOpenTag(tagName) && lastTag === tagName) {
//                     parseEndTag('', tagName);
//                 }
//             }

//             var unary = isUnaryTag$$1(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash;

//             var l = match.attrs.length;
//             var attrs = new Array(l);
//             for (var i = 0; i < l; i++) {
//                 var args = match.attrs[i];
//                 if (_this.IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
//                     if (args[3] === '') { delete args[3]; }
//                     if (args[4] === '') { delete args[4]; }
//                     if (args[5] === '') { delete args[5]; }
//                 }
//                 var value = args[3] || args[4] || args[5] || '';
//                 attrs[i] = {
//                     name: args[1],
//                     value: _this.decodeAttr(
//                         value,
//                         options.shouldDecodeNewlines
//                     )
//                 };
//             }

//             if (!unary) {
//                 stack.push({ tag: tagName, attrs: attrs });
//                 lastTag = tagName;
//                 unarySlash = '';
//             }

//             if (options.start) {
//                 options.start(tagName, attrs, unary, match.start, match.end);
//             }
//         }

//         function parseEndTag(tag?: any, tagName?: any, start?: any, end?: any) {
//             var pos;
//             if (start == null) { start = index; }
//             if (end == null) { end = index; }

//             // Find the closest opened tag of the same type
//             if (tagName) {
//                 var needle = tagName.toLowerCase();
//                 for (pos = stack.length - 1; pos >= 0; pos--) {
//                     if (stack[pos].tag.toLowerCase() === needle) {
//                         break
//                     }
//                 }
//             } else {
//                 // If no tag name is provided, clean shop
//                 pos = 0;
//             }

//             if (pos >= 0) {
//                 // Close all the open elements, up the stack
//                 for (var i = stack.length - 1; i >= pos; i--) {
//                     if (options.end) {
//                         options.end(stack[i].tag, start, end);
//                     }
//                 }

//                 // Remove the open elements from the stack
//                 stack.length = pos;
//                 lastTag = pos && stack[pos - 1].tag;
//             } else if (tagName.toLowerCase() === 'br') {
//                 if (options.start) {
//                     options.start(tagName, [], true, start, end);
//                 }
//             } else if (tagName.toLowerCase() === 'p') {
//                 if (options.start) {
//                     options.start(tagName, [], false, start, end);
//                 }
//                 if (options.end) {
//                     options.end(tagName, start, end);
//                 }
//             }
//         }
//     }

//     private ieNSBug = /^xmlns:NS\d+/;
//     private ieNSPrefix = /^NS\d+:/;

//     private guardIESVGBug (attrs: any) {
//         var res = [];
//         for (var i = 0; i < attrs.length; i++) {
//             var attr = attrs[i];
//             if (!this.ieNSBug.test(attr.name)) {
//                 attr.name = attr.name.replace(this.ieNSPrefix, '');
//                 res.push(attr);
//             }
//         }
//         return res
//     }

//     private pluckModuleFunction(modules: any,key: any) {
//         return modules
//             ? modules.map(function (m: any) { return m[key]; }).filter(function (_: any) { return _; })
//             : []
//     }

//     private makeAttrsMap(attrs: any) {
//         var map = {};
//         for (var i = 0, l = attrs.length; i < l; i++) {
//             map[attrs[i].name] = attrs[i].value;
//         }
//         return map
//     }

//     private isForbiddenTag(el: any) {
//         return (
//             el.tag === 'style' ||
//             (el.tag === 'script' && (
//                 !el.attrsMap.type ||
//                 el.attrsMap.type === 'text/javascript'
//             ))
//         )
//     }

//     private getAndRemoveAttr(el: any, name: any) {
//         var val;
//         if ((val = el.attrsMap[name]) != null) {
//             var list = el.attrsList;
//             for (var i = 0, l = list.length; i < l; i++) {
//                 if (list[i].name === name) {
//                     list.splice(i, 1);
//                     break
//                 }
//             }
//         }
//         return val
//     }

//     private processPre (el: any) {
//         if (this.getAndRemoveAttr(el, 'v-pre') != null) {
//             el.pre = true;
//         }
//     }

//     private parseText(
//         text: any,
//         delimiters: any
//     ) {
//         var tagRE = delimiters ? this.buildRegex(delimiters) : this.defaultTagRE;
//         if (!tagRE.test(text)) {
//             return
//         }
//         var tokens = [];
//         var lastIndex = tagRE.lastIndex = 0;
//         var match, index;
//         while ((match = tagRE.exec(text))) {
//             index = match.index;
//             // push text token
//             if (index > lastIndex) {
//                 tokens.push(JSON.stringify(text.slice(lastIndex, index)));
//             }
//             // tag token
//             var exp = this.parseFilters(match[1].trim());
//             tokens.push(("_s(" + exp + ")"));
//             lastIndex = index + match[0].length;
//         }
//         if (lastIndex < text.length) {
//             tokens.push(JSON.stringify(text.slice(lastIndex)));
//         }
//         return tokens.join('+')
//     }

//     private defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;

//     private regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

//     private buildRegex = this.cached((delimiters: any) => {
//         var open = delimiters[0].replace(this.regexEscapeRE, '\\$&');
//         var close = delimiters[1].replace(this.regexEscapeRE, '\\$&');
//         return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
//     });

//     private validDivisionCharRE = /[\w).+\-_$\]]/;

//     private wrapFilter(exp: any, filter: any) {
//         var i = filter.indexOf('(');
//         if (i < 0) {
//             // _f: resolveFilter
//             return ("_f(\"" + filter + "\")(" + exp + ")")
//         } else {
//             var name = filter.slice(0, i);
//             var args = filter.slice(i + 1);
//             return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
//         }
//     }

//     private parseFilters(exp: any) {
//         var inSingle = false;
//         var inDouble = false;
//         var inTemplateString = false;
//         var inRegex = false;
//         var curly = 0;
//         var square = 0;
//         var paren = 0;
//         var lastFilterIndex = 0;
//         var c;
//         let prev;
//         let i: number;
//         let expression;
//         let filters: any;

//         for (i = 0; i < exp.length; i++) {
//             prev = c;
//             c = exp.charCodeAt(i);
//             if (inSingle) {
//                 if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
//             } else if (inDouble) {
//                 if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
//             } else if (inTemplateString) {
//                 if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
//             } else if (inRegex) {
//                 if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
//             } else if (
//                 c === 0x7C && // pipe
//                 exp.charCodeAt(i + 1) !== 0x7C &&
//                 exp.charCodeAt(i - 1) !== 0x7C &&
//                 !curly && !square && !paren
//             ) {
//                 if (expression === undefined) {
//                     // first filter, end of expression
//                     lastFilterIndex = i + 1;
//                     expression = exp.slice(0, i).trim();
//                 } else {
//                     pushFilter();
//                 }
//             } else {
//                 switch (c) {
//                     case 0x22: inDouble = true; break         // "
//                     case 0x27: inSingle = true; break         // '
//                     case 0x60: inTemplateString = true; break // `
//                     case 0x28: paren++; break                 // (
//                     case 0x29: paren--; break                 // )
//                     case 0x5B: square++; break                // [
//                     case 0x5D: square--; break                // ]
//                     case 0x7B: curly++; break                 // {
//                     case 0x7D: curly--; break                 // }
//                 }
//                 if (c === 0x2f) { // /
//                     var j = i - 1;
//                     var p = (void 0);
//                     // find first non-whitespace prev char
//                     for (; j >= 0; j--) {
//                         p = exp.charAt(j);
//                         if (p !== ' ') { break }
//                     }
//                     if (!p || !this.validDivisionCharRE.test(p)) {
//                         inRegex = true;
//                     }
//                 }
//             }
//         }

//         if (expression === undefined) {
//             expression = exp.slice(0, i).trim();
//         } else if (lastFilterIndex !== 0) {
//             pushFilter();
//         }

//         function pushFilter() {
//             (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
//             lastFilterIndex = i + 1;
//         }

//         if (filters) {
//             for (i = 0; i < filters.length; i++) {
//                 expression = this.wrapFilter(expression, filters[i]);
//             }
//         }

//         return expression
//     }

//     private parseFor(exp: any) {
//         var inMatch = exp.match(this.forAliasRE);
//         if (!inMatch) { return }
//         var res: any = {};
//         res.for = inMatch[2].trim();
//         var alias = inMatch[1].trim().replace(this.stripParensRE, '');
//         var iteratorMatch = alias.match(this.forIteratorRE);
//         if (iteratorMatch) {
//             res.alias = alias.replace(this.forIteratorRE, '');
//             res.iterator1 = iteratorMatch[1].trim();
//             if (iteratorMatch[2]) {
//                 res.iterator2 = iteratorMatch[2].trim();
//             }
//         } else {
//             res.alias = alias;
//         }
//         return res
//     }

//     private extend(to: any, _from: any) {
//         for (var key in _from) {
//             to[key] = _from[key];
//         }
//         return to
//     }

//     private processFor(el: any) {
//         var exp;
//         if ((exp = this.getAndRemoveAttr(el, 'v-for'))) {
//             var res = this.parseFor(exp);
//             if (res) {
//                 this.extend(el, res);
//             } else {
//             }
//         }
//     }

//     private addIfCondition(el: any, condition: any) {
//         if (!el.ifConditions) {
//             el.ifConditions = [];
//         }
//         el.ifConditions.push(condition);
//     }

//     private findPrevElement(children: any) {
//         var i = children.length;
//         while (i--) {
//             if (children[i].type === 1) {
//                 return children[i]
//             } else {
//                 children.pop();
//             }
//         }
//     }

//     private processIfConditions(el: any, parent: any) {
//         var prev = this.findPrevElement(parent.children);
//         if (prev && prev.if) {
//             this.addIfCondition(prev, {
//                 exp: el.elseif,
//                 block: el
//             });
//         }
//     }

//     private processIf(el: any) {
//         var exp = this.getAndRemoveAttr(el, 'v-if');
//         if (exp) {
//             el.if = exp;
//             this.addIfCondition(el, {
//                 exp: exp,
//                 block: el
//             });
//         } else {
//             if (this.getAndRemoveAttr(el, 'v-else') != null) {
//                 el.else = true;
//             }
//             var elseif = this.getAndRemoveAttr(el, 'v-else-if');
//             if (elseif) {
//                 el.elseif = elseif;
//             }
//         }
//     }

//     private processOnce(el: any) {
//         var once$$1 = this.getAndRemoveAttr(el, 'v-once');
//         if (once$$1 != null) {
//             el.once = true;
//         }
//     }

//     private getBindingAttr(
//         el: any,
//         name: any,
//         getStatic?: any
//     ) {
//         var dynamicValue =
//             this.getAndRemoveAttr(el, ':' + name) ||
//             this.getAndRemoveAttr(el, 'v-bind:' + name);
//         if (dynamicValue != null) {
//             return this.parseFilters(dynamicValue)
//         } else if (getStatic !== false) {
//             var staticValue = this.getAndRemoveAttr(el, name);
//             if (staticValue != null) {
//                 return JSON.stringify(staticValue)
//             }
//         }
//     }

//     private checkInFor(el: any) {
//         var parent = el;
//         while (parent) {
//             if (parent.for !== undefined) {
//                 return true
//             }
//             parent = parent.parent;
//         }
//         return false
//     }

//     private processRef(el: any) {
//         var ref = this.getBindingAttr(el, 'ref');
//         if (ref) {
//             el.ref = ref;
//             el.refInFor = this.checkInFor(el);
//         }
//     }

//     private processKey(el: any) {
//         var exp = this.getBindingAttr(el, 'key');
//         if (exp) {
//             el.key = exp;
//         }
//     }

//     private processRawAttrs(el: any) {
//         var l = el.attrsList.length;
//         if (l) {
//             var attrs = el.attrs = new Array(l);
//             for (var i = 0; i < l; i++) {
//                 attrs[i] = {
//                     name: el.attrsList[i].name,
//                     value: JSON.stringify(el.attrsList[i].value)
//                 };
//             }
//         } else if (!el.pre) {
//             // non root node in pre blocks with no attributes
//             el.plain = true;
//         }
//     }

//     private addProp(el: any, name: any, value: any) {
//         (el.props || (el.props = [])).push({ name: name, value: value });
//         el.plain = false;
//     }

//     private addAttr(el: any, name: any, value: any) {
//         (el.attrs || (el.attrs = [])).push({ name: name, value: value });
//         el.plain = false;
//     }

//     private processSlot(el: any) {
//         if (el.tag === 'slot') {
//             el.slotName = this.getBindingAttr(el, 'name');
//         } else {
//             var slotScope;
//             if (el.tag === 'template') {
//                 slotScope = this.getAndRemoveAttr(el, 'scope');
//                 /* istanbul ignore if */
//                 el.slotScope = slotScope || this.getAndRemoveAttr(el, 'slot-scope');
//             } else if ((slotScope = this.getAndRemoveAttr(el, 'slot-scope'))) {
//                 /* istanbul ignore if */
//                 el.slotScope = slotScope;
//             }
//             var slotTarget = this.getBindingAttr(el, 'slot');
//             if (slotTarget) {
//                 el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
//                 // preserve slot as an attribute for native shadow DOM compat
//                 // only for non-scoped slots.
//                 if (el.tag !== 'template' && !el.slotScope) {
//                     this.addAttr(el, 'slot', slotTarget);
//                 }
//             }
//         }
//     }

//     private processComponent(el: any) {
//         var binding;
//         if ((binding = this.getBindingAttr(el, 'is'))) {
//             el.component = binding;
//         }
//         if (this.getAndRemoveAttr(el, 'inline-template') != null) {
//             el.inlineTemplate = true;
//         }
//     }

//     private parseModifiers(name: any) {
//         var match = name.match(this.modifierRE);
//         if (match) {
//             var ret = {};
//             match.forEach((m: any) => { ret[m.slice(1)] = true; });
//             return ret;
//         }
//         return null;
//     }

//     private checkForAliasModel(el: any, value: any) {
//         var _el = el;
//         while (_el) {
//             _el = _el.parent;
//         }
//     }

//     private addDirective(
//         el: any,
//         name: any,
//         rawName: any,
//         value: any,
//         arg: any,
//         modifiers: any
//     ) {
//         (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
//         el.plain = false;
//     }

//     private camelizeRE = /-(\w)/g;
//     private camelize = this.cached((str: any) => {
//         return str.replace(this.camelizeRE, function (_: any, c: any) { return c ? c.toUpperCase() : ''; })
//     });

//     private emptyObject = Object.freeze({});

//     private addHandler(
//         el: any,
//         name: any,
//         value: any,
//         modifiers?: any,
//         important?: any
//     ) {
//         modifiers = modifiers || this.emptyObject;
//         // check capture modifier
//         if (modifiers.capture) {
//             delete modifiers.capture;
//             name = '!' + name; // mark the event as captured
//         }
//         if (modifiers.once) {
//             delete modifiers.once;
//             name = '~' + name; // mark the event as once
//         }
//         /* istanbul ignore if */
//         if (modifiers.passive) {
//             delete modifiers.passive;
//             name = '&' + name; // mark the event as passive
//         }

//         // normalize click.right and click.middle since they don't actually fire
//         // this is technically browser-specific, but at least for now browsers are
//         // the only target envs that have right/middle clicks.
//         if (name === 'click') {
//             if (modifiers.right) {
//                 name = 'contextmenu';
//                 delete modifiers.right;
//             } else if (modifiers.middle) {
//                 name = 'mouseup';
//             }
//         }

//         var events;
//         if (modifiers.native) {
//             delete modifiers.native;
//             events = el.nativeEvents || (el.nativeEvents = {});
//         } else {
//             events = el.events || (el.events = {});
//         }

//         var newHandler: any = {
//             value: value.trim()
//         };
//         if (modifiers !== this.emptyObject) {
//             newHandler.modifiers = modifiers;
//         }

//         var handlers = events[name];
//         /* istanbul ignore if */
//         if (Array.isArray(handlers)) {
//             important ? handlers.unshift(newHandler) : handlers.push(newHandler);
//         } else if (handlers) {
//             events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
//         } else {
//             events[name] = newHandler;
//         }

//         el.plain = false;
//     }

//     private len: any;
//     private str: any;
//     private chr: any;
//     private index$1: any;
//     private expressionPos: any;
//     private expressionEndPos: any;

//     private next() {
//         return this.str.charCodeAt(++this.index$1);
//     }
      
//     private eof() {
//         return this.index$1 >= this.len;
//     }

//     private isStringStart(chr: any) {
//         return chr === 0x22 || chr === 0x27
//     }

//     private parseString(chr: any) {
//         var stringQuote = chr;
//         while (!this.eof()) {
//             chr = this.next();
//             if (chr === stringQuote) {
//                 break
//             }
//         }
//     }

//     private parseBracket(chr: any) {
//         var inBracket = 1;
//         this.expressionPos = this.index$1;
//         while (!this.eof()) {
//             chr = this.next();
//             if (this.isStringStart(chr)) {
//                 this.parseString(chr);
//                 continue
//             }
//             if (chr === 0x5B) { inBracket++; }
//             if (chr === 0x5D) { inBracket--; }
//             if (inBracket === 0) {
//                 this.expressionEndPos = this.index$1;
//                 break
//             }
//         }
//     }

//     private parseModel(val: any) {
//         // Fix https://github.com/vuejs/vue/pull/7730
//         // allow v-model="obj.val " (trailing whitespace)
//         val = val.trim();
//         this.len = val.length;

//         if (val.indexOf('[') < 0 || val.lastIndexOf(']') < this.len - 1) {
//             this.index$1 = val.lastIndexOf('.');
//             if (this.index$1 > -1) {
//                 return {
//                     exp: val.slice(0, this.index$1),
//                     key: '"' + val.slice(this.index$1 + 1) + '"'
//                 }
//             } else {
//                 return {
//                     exp: val,
//                     key: null
//                 }
//             }
//         }

//         this.str = val;
//         this.index$1 = this.expressionPos = this.expressionEndPos = 0;

//         while (!this.eof()) {
//             this.chr = this.next();
//             /* istanbul ignore if */
//             if (this.isStringStart(this.chr)) {
//                 this.parseString(this.chr);
//             } else if (this.chr === 0x5B) {
//                 this.parseBracket(this.chr);
//             }
//         }

//         return {
//             exp: val.slice(0, this.expressionPos),
//             key: val.slice(this.expressionPos + 1, this.expressionEndPos)
//         }
//     }

//     private genAssignmentCode(
//         value: any,
//         assignment: any
//     ) {
//         var res = this.parseModel(value);
//         if (res.key === null) {
//             return (value + "=" + assignment)
//         } else {
//             return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
//         }
//     }

//     private processAttrs(el: any) {
//         var list = el.attrsList;
//         var i, l, name, rawName, value, modifiers: any, isProp;
//         for (i = 0, l = list.length; i < l; i++) {
//             name = rawName = list[i].name;
//             value = list[i].value;
//             if (this.dirRE.test(name)) {
//                 // mark element as dynamic
//                 el.hasBindings = true;
//                 // modifiers
//                 modifiers = this.parseModifiers(name);
//                 if (modifiers) {
//                     name = name.replace(this.modifierRE, '');
//                 }
//                 if (this.bindRE.test(name)) { // v-bind
//                     name = name.replace(this.bindRE, '');
//                     value = this.parseFilters(value);
//                     isProp = false;
//                     if (modifiers) {
//                         if (modifiers.prop) {
//                             isProp = true;
//                             name = this.camelize(name);
//                             if (name === 'innerHtml') { name = 'innerHTML'; }
//                         }
//                         if (modifiers.camel) {
//                             name = this.camelize(name);
//                         }
//                         if (modifiers.sync) {
//                             this.addHandler(
//                                 el,
//                                 ("update:" + (this.camelize(name))),
//                                 this.genAssignmentCode(value, "$event")
//                             );
//                         }
//                     }
//                     if (isProp || (
//                         !el.component && this.platformMustUseProp(el.tag, el.attrsMap.type, name)
//                     )) {
//                         this.addProp(el, name, value);
//                     } else {
//                         this.addAttr(el, name, value);
//                     }
//                 } else if (this.onRE.test(name)) { // v-on
//                     name = name.replace(this.onRE, '');
//                     this.addHandler(el, name, value, modifiers, false);
//                 } else { // normal directives
//                     name = name.replace(this.dirRE, '');
//                     // parse arg
//                     var argMatch = name.match(this.argRE);
//                     var arg = argMatch && argMatch[1];
//                     if (arg) {
//                         name = name.slice(0, -(arg.length + 1));
//                     }
//                     this.addDirective(el, name, rawName, value, arg, modifiers);
//                     if (name === 'model') {
//                         this.checkForAliasModel(el, value);
//                     }
//                 }
//             } else {
//                 // literal attribute
//                 // {
//                 //     this.parseText(value, this.delimiters);
//                 // }
//                 this.addAttr(el, name, JSON.stringify(value));
//                 // #6887 firefox doesn't update muted state if set via attribute
//                 // even immediately after element creation
//                 if (!el.component && name === 'muted' && this.platformMustUseProp(el.tag, el.attrsMap.type, name)) {
//                     this.addProp(el, name, 'true');
//                 }
//             }
//         }
//     }

//     public parse(template: string, options?: any) {
//         //this.warn$1 = options.warn || baseWarn;
//         let _this = this;
//         this.platformGetTagNamespace = options.getTagNamespace || this.no;
//         this.platformMustUseProp = options.mustUseProp || this.no;
//         this.platformIsPreTag = options.isPreTag || this.no;
//         this.preTransforms = this.pluckModuleFunction(options.modules, 'preTransformNode');
//         this.transforms = this.pluckModuleFunction(options.modules, 'transformNode');
//         this.postTransforms = this.pluckModuleFunction(options.modules, 'postTransformNode');
//         this.delimiters = options.delimiters;
//         let stack: Array<any> = [];
//         let preserveWhitespace = options.preserveWhitespace !== false;
//         let root: any;
//         let currentParent: any;
//         let inVPre = false;
//         let inPre = false;

//         this.parseHtml(template, {
//             expectHTML: options.expectHTML,
//             isUnaryTag: options.isUnaryTag,
//             shouldDecodeNewlines: options.shouldDecodeNewlines,
//             start: function start(tag: any, attrs: any, unary: any) {
//                 // check namespace.
//                 // inherit parent ns if there is one
//                 var ns = (currentParent && currentParent.ns) || _this.platformGetTagNamespace(tag);

//                 // handle IE svg bug
//                 /* istanbul ignore if */
//                 if (_this.isIE && ns === 'svg') {
//                     attrs = _this.guardIESVGBug(attrs);
//                 }

//                 var element:any = {
//                     type: 1,
//                     tag: tag,
//                     attrsList: attrs,
//                     attrsMap: _this.makeAttrsMap(attrs),
//                     parent: currentParent,
//                     children: []
//                 };
//                 if (ns) {
//                     element.ns = ns;
//                 }

//                 if (_this.isForbiddenTag(element)) {
//                     element.forbidden = true;
//                 }

//                 // apply pre-transforms
//                 for (var i = 0; i < _this.preTransforms.length; i++) {
//                     _this.preTransforms[i](element, options);
//                 }

//                 if (!inVPre) {
//                     _this.processPre(element);
//                     if (element.pre) {
//                         inVPre = true;
//                     }
//                 }
//                 if (_this.platformIsPreTag(element.tag)) {
//                     inPre = true;
//                 }
//                 if (inVPre) {
//                     _this.processRawAttrs(element);
//                 } else {
//                     _this.processFor(element);
//                     _this.processIf(element);
//                     _this.processOnce(element);
//                     _this.processKey(element);

//                     // determine whether this is a plain element after
//                     // removing structural attributes
//                     element.plain = !element.key && !attrs.length;

//                     _this.processRef(element);
//                     _this.processSlot(element);
//                     _this.processComponent(element);
//                     for (var i$1 = 0; i$1 < _this.transforms.length; i$1++) {
//                         _this.transforms[i$1](element, options);
//                     }
//                     _this.processAttrs(element);
//                 }

                

//                 // tree management
//                 if (!root) {
//                     root = element;
//                 } else if (!stack.length) {
//                     // allow root elements with v-if, v-else-if and v-else
//                     if (root.if && (element.elseif || element.else)) {
//                         _this.addIfCondition(root, {
//                             exp: element.elseif,
//                             block: element
//                         });
//                     }
//                 }
//                 if (currentParent && !element.forbidden) {
//                     if (element.elseif || element.else) {
//                         _this.processIfConditions(element, currentParent);
//                     } else if (element.slotScope) { // scoped slot
//                         currentParent.plain = false;
//                         var name = element.slotTarget || 'default'; (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
//                     } else {
//                         currentParent.children.push(element);
//                         element.parent = currentParent;
//                     }
//                 }
//                 if (!unary) {
//                     currentParent = element;
//                     stack.push(element);
//                 }
//                 // apply post-transforms
//                 for (var i$2 = 0; i$2 < _this.postTransforms.length; i$2++) {
//                     _this.postTransforms[i$2](element, options);
//                 }
//             },

//             end: function end() {
//                 // remove trailing whitespace
//                 var element = stack[stack.length - 1];
//                 var lastNode = element.children[element.children.length - 1];
//                 if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
//                     element.children.pop();
//                 }
//                 // pop stack
//                 stack.length -= 1;
//                 currentParent = stack[stack.length - 1];
//                 // check pre state
//                 if (element.pre) {
//                     inVPre = false;
//                 }
//                 if (_this.platformIsPreTag(element.tag)) {
//                     inPre = false;
//                 }
//             },

//             chars: function chars(text: any) {
//                 if (!currentParent) {
//                     return
//                 }
//                 // IE textarea placeholder bug
//                 /* istanbul ignore if */
//                 if (_this.isIE &&
//                     currentParent.tag === 'textarea' &&
//                     currentParent.attrsMap.placeholder === text) {
//                     return
//                 }
//                 text = inPre || text.trim()
//                     ? _this.decodeHTMLCached(text)
//                     // only preserve whitespace if its not right after a starting tag
//                     : preserveWhitespace && currentParent.children.length ? ' ' : '';
//                 if (text) {
//                     var expression;
//                     if (!inVPre && text !== ' ' && (expression = _this.parseText(text, _this.delimiters))) {
//                         currentParent.children.push({
//                             type: 2,
//                             expression: expression,
//                             text: text
//                         });
//                     } else {
//                         currentParent.children.push({
//                             type: 3,
//                             text: text
//                         });
//                     }
//                 }
//             }
//         });
//         return root
//     }
// }