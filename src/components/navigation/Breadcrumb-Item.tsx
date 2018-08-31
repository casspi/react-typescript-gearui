import * as Tag from '../Tag';
export default class BreadcrumbItem extends Tag.default<typeof Tag.props, Tag.state> {
    
    getInitialState() {
        return {};
    }

    render() {
        return this.props.children;
    }
}