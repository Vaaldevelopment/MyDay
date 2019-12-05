import { Injectable } from '@angular/core';
import { CalendarSchedulerEvent } from 'angular-calendar-scheduler';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};
let events = [
  {
    id: '1',
    start: subDays(startOfDay(new Date()), 1),
    end: addDays(new Date(), 1),
    title: 'A 3 day event',
    color: colors.red,
    actions: [{
      when: 'enabled',
      label: 'hola',
      title: 'titulo',
      onClick(event: CalendarSchedulerEvent) {
      }
    }]
  },
  {
    id: '2',
    start: startOfDay(new Date()),
    title: 'An event with no end date',
    color: colors.yellow,

    actions: [{
      when: 'enabled',
      label: 'hola2',
      title: 'titulo2',
      onClick(event: CalendarSchedulerEvent) {
      }
    }]
  },
  {
    id: '3',
    start: subDays(endOfMonth(new Date()), 3),
    end: addDays(endOfMonth(new Date()), 3),
    title: 'A long event that spans 2 months',
    color: colors.blue,
    actions: [{
      when: 'enabled',
      label: 'hola3',
      title: 'titulo3',
      onClick(event: CalendarSchedulerEvent) {
      }
    }]
  },
  {
    id: '4',
    start: addHours(startOfDay(new Date()), 2),
    end: new Date(),
    title: 'A draggable and resizable event',
    color: colors.yellow,
    actions: [{
      when: 'enabled',
      label: 'hola4',
      title: 'titulo4',
      onClick(event: CalendarSchedulerEvent) {
      }
    }]
  }
];

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }
  getEvents(actions) {
    return new Promise((response, reject) => {
      response(events);
    })
  }
}
