interface Injects {
    model: any;
    services: Record<any, any>;
}
export declare function inject(injects: Injects): (constructor: Function) => void;
export declare function database(): (_: any, __: string | symbol, descriptor: any) => any;
export declare function isSuperAdmin(): (_: any, __: string | symbol, descriptor: any) => any;
export declare function hasPermission(permission: string, field: string): (_: any, __: string | symbol, descriptor: any) => any;
export declare function wrapper(): (_: any, __: string | symbol, descriptor: any) => any;
export declare function parseUser(): (_: any, __: string | symbol, descriptor: any) => any;
export declare function defaultCreate(hasFunction: boolean): (_: any, __: string | symbol, descriptor: any) => any;
export declare function defaultUpdate(hasFunction: boolean, name: string): (_: any, __: string | symbol, descriptor: any) => any;
export declare function defaultGet(name: string): (_: any, __: string | symbol, descriptor: any) => any;
export declare function defaultList(name: string): (_: any, __: string | symbol, descriptor: any) => any;
export declare function action(): (_: any, __: string | symbol, descriptor: any) => any;
export declare function body(type: any): (_: any, __: string | symbol, descriptor: any) => any;
export {};
