// types/global.d.ts
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  interface Element {}
  interface ElementClass {}
  interface ElementAttributesProperty {}
  interface ElementChildrenAttribute {}
  interface IntrinsicAttributes {}
  interface IntrinsicClassAttributes<T> {}
}

declare module "react" {
  export interface ComponentProps<T> {
    [key: string]: any;
  }
  
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prevValue: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  
  export interface ChangeEvent<T = Element> {
    target: T & EventTarget;
  }
  
  export default React;
}

declare module "lucide-react" {
  import { FC } from 'react';
  
  export const Calendar: FC<any>;
  export const Edit: FC<any>;
  export const Trash2: FC<any>;
  export const Eye: FC<any>;
  export const EyeOff: FC<any>;
  export const MapPin: FC<any>;
  export const Users: FC<any>;
  export const Star: FC<any>;
  export const CheckCircle: FC<any>;
  export const X: FC<any>;
  export const User: FC<any>;
  export const Phone: FC<any>;
  export const Mail: FC<any>;
  export const Clock: FC<any>;
  export const DollarSign: FC<any>;
}