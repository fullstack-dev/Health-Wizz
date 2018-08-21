import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()

export class TokenService {

	public token: BehaviorSubject<String>;

	constructor() {
		this.token = <BehaviorSubject<String>>new BehaviorSubject(null);
	}

	set(token) {
		localStorage.setItem('token', token);
		this.token.next(token);
		return token;
	}

	get() {
		let token = localStorage.getItem('token');
		if (token != this.token.getValue()) {
			this.token.next(window.localStorage.getItem('token'));
		}
		return token;
	}

	reset() {
		localStorage.removeItem('token');
		this.token.next(null);
		return true;
	}

	subscribe(onChange, onError) {
		this.token.asObservable().subscribe(
			t => onChange(t),
			e => onError(e)
		);
	}
}