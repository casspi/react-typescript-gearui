import { Validator } from './index';
import { Http } from '../utils';
export default class RemoteValidator extends Validator {

    name:string = this.name || "remote";

    validator = (rule: any,value: any,callback: any) => {
        let remote: any = this.props.remote;
		if(typeof remote === 'function') {
			var ctl = G.G$("#"+this.props.name);
			if(ctl) {
				remote = remote.call(ctl);
			}else {
				remote = remote();
			}
		}
		if(remote == null) {
			callback();
			return;
		}
		remote = Http.absoluteUrl(remote);
        let remoteKey = this.props.remoteKey || "value";
        if(remote.indexOf("?") != -1) {
            remote += "&" + remoteKey + "=" + value;
        }else {
            remote += "?" + remoteKey + "=" + value;
        }
        let data = Http.post(false,remote);
        if(data.message == null || G.G$.trim(data.message) == "") {
            callback();
            return;
        }
        callback(data.message);
    }
}