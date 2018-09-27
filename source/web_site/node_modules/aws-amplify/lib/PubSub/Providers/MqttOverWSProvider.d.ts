/// <reference types="paho-mqtt" />
/// <reference types="zen-observable" />
import { Client } from 'paho-mqtt';
import * as Observable from 'zen-observable';
import { AbstractPubSubProvider } from './PubSubProvider';
export interface MqttProvidertOptions {
    clientId?: string;
    url?: string;
}
export declare class MqttOverWSProvider extends AbstractPubSubProvider {
    private clientsQueue;
    constructor(options?: MqttProvidertOptions);
    protected readonly clientId: any;
    protected readonly endpoint: any;
    getProviderName(): string;
    newClient({url, clientId}: MqttProvidertOptions): Promise<Client>;
    protected connect(clientId: string, options?: MqttProvidertOptions): Promise<Client>;
    protected disconnect(clientId: string): Promise<void>;
    publish(topics: string[] | string, msg: any): Promise<void>;
    private _topicObservers;
    private _onMessage(topic, msg);
    subscribe(topics: string[] | string, options?: MqttProvidertOptions): Observable<any>;
}
