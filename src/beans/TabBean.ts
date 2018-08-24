import App from './App';
import Item from './Item';
import Menu from './Menu';
export default interface TabBean {
    app?: App;
    item?: Item;
    menu?: Menu;
    visible?: boolean;
}