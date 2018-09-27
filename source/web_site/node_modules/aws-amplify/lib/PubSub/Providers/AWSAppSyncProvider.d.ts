/// <reference types="zen-observable" />
import * as Observable from 'zen-observable';
import { MqttOverWSProvider } from './MqttOverWSProvider';
export declare class AWSAppSyncProvider extends MqttOverWSProvider {
    protected readonly endpoint: void;
    getProviderName(): string;
    publish(topics: string[] | string, msg: any, options?: any): Promise<void>;
    private _topicObserver;
    subscribe(topics: string[] | string, options?: any): Observable<any>;
}
