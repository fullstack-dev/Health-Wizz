import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderSeed',
})
export class OrderSeed implements PipeTransform {
    transform(seedStrings: string[], args?: any) {
        return seedStrings.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            if (a == b) {
                return 0;
            }
        });
    }
}
