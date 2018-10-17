import * as React from 'react';
import * as Tag from './Tag';
import { Http } from '../utils';

export var props = {
    ...Tag.props,
    url: GearType.Or(GearType.String, GearType.Function),
    type: GearType.String,
    protocol: GearType.String,
    debug: GearType.Boolean,
    reconnectInterval: GearType.Number,
    reconnect: GearType.Boolean
};

export interface state extends Tag.state {
    url: string | Function;
    type?: string;
    protocol?: string;
    debug?: boolean;
    // 重连时间间隔
    reconnectInterval?: number;
    // 是否重连
    reconnect?: boolean;
    ws: any;
    attempts: number;
}
export default class Websocket<P extends typeof props, S extends state> extends Tag.default<P, S> {

    private timeoutID: any;

    getInitialState():state {
        return {
            ws: this._initWebSocket(),
            attempts: 1,
            url: this.props.url || Http.absoluteUrl("/realTimeMessageServer"),
            type: this.props.type,
            protocol: this.props.protocol,
            debug: this.props.debug,
            reconnectInterval: this.props.reconnectInterval,
            reconnect: this.props.reconnect
        };
    }

    protected _initWebSocket() {
        //let url = this.props.url || 'ws://localhost:8080/web/realTimeMessageServer';
        let url: any = this.state.url;
        let host = window.location.host;
        url = "ws://" + host + url;
        let ws;
        if (url && (/^https?:\/\/.+$/.test(url) || /^wss?:\/\/.+$/.test(url))) {

            if (typeof (WebSocket) != 'undefined') {
                if (/^https?:\/\/.+$/.test(url)) {
                    url = url.replace(/^https?(.+)/, "ws$1");
                }
                url = url + "/websocket?type=" + (this.state.type || "");
                ws = new WebSocket(url, this.state.protocol);
            } else {
                if (/^ws:\/\/.+$/.test(url)) {
                    url = url.replace(/^ws(.+)/, "http$1");
                }
                url = url + "/sockjs?type=" + (this.state.type || "");
                ws = new G.SockJs(url, this.state.protocol);
                // SockJs支持的协议
                // var _all_protocols = [
                //       'websocket',
                //       'xdr-streaming',
                //       'xhr-streaming',
                //       'iframe-eventsource',
                //       'iframe-htmlfile',
                //       'xdr-polling',
                //       'xhr-polling',
                //       'iframe-xhr-polling',
                //       'jsonp-polling'];          
            }
        }
        return ws;
    }

    logging(logline: any) {
        if (this.state.debug === true) {
        }
    }

    generateInterval(k: any) {
        if (this.state.reconnectInterval > 0) {
            return this.state.reconnectInterval;
        }
        return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
    }

    setupWebsocket() {
        let websocket = this.state['ws'];

        websocket.onopen = (evt: any, data: any) => {
            this.logging('Websocket connected');
            //console.log(evt);
            //console.log(websocket.readyState);
            if (this.haveEvent("open")) {
                this.doEvent("open");
            }
        };

        websocket.onmessage = (evt: any) => {
            if (this.haveEvent("message")) {
                this.doEvent("message");
            }
        };

        websocket.onerror = (evt: any) => {
            if (this.haveEvent("error")) {
                this.doEvent("error");
            }
        };

        let shouldReconnect = this.state.reconnect;
        websocket.onclose = () => {
            this.logging('Websocket disconnected');
            if (this.haveEvent("close")) {
                this.doEvent("close");
            }
            if (shouldReconnect == true) {
                let time = this.generateInterval(this.state.attempts);
                this.timeoutID = setTimeout(() => {
                    this.setState({ attempts: this.state.attempts + 1 });
                    this.setState({ ws: this._initWebSocket() });
                    this.setupWebsocket();
                }, time);
            }
        }
    }

    afterRender() {
        this.setupWebsocket();
    }

    componentWillUnmount() {
        this.setState({
            reconnect: false
        });
        clearTimeout(this.timeoutID);
        let websocket = this.state.ws;
        websocket.close();
    }

    sendMessage(message: any) {
        if (message) {
            let websocket = this.state.ws;
            // WebSocket.OPEN
            if (websocket && websocket.readyState === 1) {
                if (typeof message == "string")
                    websocket.send(message);
                else
                    websocket.send(JSON.stringify(message));
            }
        }
    }

    isOpen() {
        let websocket = this.state.ws;
        if (websocket && websocket.readyState === 1) {
            return true;
        } else {
            return false;
        }
    }

    open() {
        if (this.isOpen() == false) {
            this.setupWebsocket();
        }
    }

    close() {
        let websocket = this.state.ws;
        if (websocket && websocket.readyState === 1) {
            websocket.close();
        }
    }

    makeJsx() {
        return (
            <div></div>
        );
    }
}