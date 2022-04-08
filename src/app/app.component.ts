import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { TodolistService, TodoList, TodoItem } from './todolist.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'TODO-LIST';
  todoList: TodoList | any;
  todoListObs!: Observable<TodoList>;

  @Input() data!: TodoItem;
  @Output() update = new EventEmitter<Partial<TodoItem>>();
  @Output() remove = new EventEmitter<TodoItem>();

  constructor(public service: TodolistService, public auth: AngularFireAuth) {
    this.todoListObs = service.observable;
  }

  trackByMethod(index: number, item: TodoItem): number {
    return item.id;
  }

  delete(item: TodoItem): void {
    this.remove.emit(item);
  }

  log(message: any) {
    console.log(message);
  }

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.auth.signOut();
  }
}
