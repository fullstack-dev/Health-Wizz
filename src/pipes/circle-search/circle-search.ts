import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'circleSearch',
})
export class CircleSearchPipe implements PipeTransform {
  transform(circles: any[], filter: any) {
    return circles.filter(function (circle) {
      try {
        if (filter == null || filter == undefined) {
          return true;
        }
        const name: string = circle.name;
        if (name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    });
  }
}
