import { Pipe, PipeTransform } from '@angular/core';
import { InviteContact } from '../../models/classes';

@Pipe({
  name: 'invitePeopleSearch',
})
export class InvitePeopleSearchPipe implements PipeTransform {

  transform(contacts: InviteContact[], filter: any) {
    return contacts.filter(function (contact) {
      try {
        if (filter == null || filter == undefined) {
          return true;
        }
        const name: string = contact.name;
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
