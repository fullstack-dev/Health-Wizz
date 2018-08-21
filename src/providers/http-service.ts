import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
@Injectable()

export class HttpService {

	// service_uri = 'https://api.healthwizz.net/mobile/v1.1/';
	// service_uri = 'http://192.168.0.36:8080/mobile/v1.1/';
	// service_uri = 'http://52.207.221.179:8080/mobile/v1.1/';
	service_uri = 'http://54.152.10.249:8080/mobile/v1.1/';

	// auth_token: any = null;
	constructor(
		private http: Http
	) { }

	public getServiceUri() {
		return this.service_uri;
	}

	public signInWithHealthwizz(url, cred) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this.http.post(this.service_uri.concat(url), cred, { headers: headers })
			.map(res => {
				return res.json();
			}, this.handleError);
	}

	public getLinkedInAccessToken(code: string, client: any) {
		const link = 'https://www.linkedin.com/oauth/v2/accessToken?' +
			'grant_type=authorization_code' +
			'&code=' + code +
			'&redirect_uri=' + client.redirect_uri +
			'&client_id=' + client.client_id +
			'&client_secret=' + client.client_secret;

		let headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		return this.http.post(link, { headers: headers })
			.map(res => {
				return res.json();
			});
	}

	public getLinkedInProfile(access_token: string) {
		const link = 'https://api.linkedin.com/v1/people/~:(firstName,lastName,id,email_address,picture-url)?format=json';
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + access_token);
		return this.http.get(link, { headers: headers })
			.map(res => {
				return res.json();
			});
	}

	public registerWithHealthwizz(url, data) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this.http.post(this.service_uri.concat(url), data, {
		})
			.toPromise()
			.then(res => {
				return res.json();
			});
	}

	getProfile() {
		let userId = localStorage.getItem('userId');
		return this.http
			.get(this.service_uri.concat('userProfile/') + userId, { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}

	get(url) {
		console.log(url);
		return this.http
			.get(this.service_uri.concat(url), { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}

	post(url, data) {
		console.log(url);
		return this.http
			.post(this.service_uri.concat(url), data, { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}

	postOMP(url) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this.http
			.get(url, { headers: headers })
			.map(this.extractData)
			.catch(this.handleError);
	}

	postGAS(url) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this.http
			.get(url, { headers: headers })
			.map(this.extractData)
			.catch(this.handleError);
	}

	put(url, data) {
		console.log(url);
		return this.http
			.put(this.service_uri.concat(url), data, { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}
	deviceDelete(url) {
		console.log(url);
		return this.http
			.delete(url, { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}

	disconnectDevice(url) {
		console.log(url);
		return this.http
			.delete(url, { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}

	delete(url) {
		console.log(url);
		return this.http
			.delete(this.service_uri.concat(url), { headers: this.getAuthHeaders() })
			.map(this.extractData)
			.catch(this.handleError);
	}

	common(url) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this.http.get(this.service_uri.concat(url), { headers: headers })
			.map(res => {
				return res.json();
			});
	}

	getGoogleProfile(accessToken) {
		const url = 'https://www.googleapis.com/plus/v1/people/me';
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + accessToken);
		return this.http.get(url, { headers: headers })
			.map(res => {
				return res.json();
			})
	}

	private getAuthHeaders(): Headers {
		let auth_token = localStorage.getItem('authToken');
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + auth_token);
		return headers;
	}

	private extractData(res: Response) {
		let body = res.json();
		return body || {};
	}

	private handleError(error: Response | any) {
		let errMsg: any;
		if (error instanceof Response) {
			const body = error.json() || '';
			// const err = body.error || JSON.stringify(body);
			// errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
			errMsg = body;
		} else {
			errMsg = error.message ? error.message : error.toString();
		}
		console.error(errMsg);
		return Observable.throw(errMsg);
	}
}