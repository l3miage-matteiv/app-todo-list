import { HostListener, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TodolistService } from './todolist.service';

interface History<T> {
  canUndo: boolean;
  canRedo: boolean;
  history: T[];
  currentIndex: number;
  current: T;

}
@Injectable({
  providedIn: 'root'
})
export class HistoryService<T> {
  previous : T[] = [];
  next : T[] = [];
  private current : T
  private currentVersion : BehaviorSubject<T>;
  public obs : Observable<History<T>>


  constructor(public tdservice: TodolistService, @Inject("todo-list") e:T) {
    this.currentVersion = new BehaviorSubject<T>(e);
    this.current = e
    this.obs = this.currentVersion.pipe(
      map((el) => ({
        canUndo:true,
        canRedo:true,
        history:[...this.previous,el,...this.next],
        currentIndex:this.previous.length,
        current:el
      }))
    );
    this.obs.subscribe(()=>console.log(this.obs));

   }
   @HostListener('document:keydown', ['$event'])
   undo():T{
     console.log("ctrl+z")
    if(this.previous.length !=0){
      this.next.push(this.current)
      this.current = this.previous[this.previous.length-1]
      delete this.previous[this.previous.length-1]
    }

    return this.current;
  }
  redo():T{
    if(this.next.length !=0){
      this.previous.push(this.current)
      this.current = this.next[this.next.length-1]
      delete this.next[this.next.length-1]
    }
    return this.current
  }
  push(e:T){
    if(this.previous.length==0){
      this.previous.push(e)
    }else{
      this.previous.push(this.current)
    }
    this.current = e
    this.next = []
  }
}
