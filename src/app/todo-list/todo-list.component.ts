import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

type FctFilter = (item: TodoItem) => boolean;

export interface TodoListExtended extends TodoList {
  allDone: boolean;
  filter: FctFilter;
  remaining: number;
  displayedItems: TodoItem[];
}

@Component({
  selector: 'todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent implements OnInit {
  @Input() titre!: string;

  todoListObs!: Observable<TodoList>;

  readonly fCompleted: FctFilter = (item: TodoItem) => item.isDone;
  readonly fNotCompleted: FctFilter = (item: TodoItem) => !item.isDone;
  readonly fAll: FctFilter = () => true;
  readonly serviceExtended: Observable<TodoListExtended>;
  private currentFilter = new BehaviorSubject<FctFilter>(this.fAll);

  constructor(public service: TodolistService) {
    this.serviceExtended = combineLatest([
      service.observable,
      this.currentFilter,
    ]).pipe(
      map(([L, f]) => ({
        ...L,
        displayedItems: L.items.filter(f),
        remaining: L.items.reduce((nb, it) => (it.isDone ? nb : nb + 1), 0),
        filter: f,
        allDone: !L.items.find((i) => !i.isDone),
      }))
    );
  }

  ngOnInit(): void {}

  trackByMethod(index: number, item: TodoItem): number {
    return item.id;
  }

  createItem(nomItem: string) {
    this.service.create(nomItem);
  }

  updateItem(data: Partial<TodoItem>, item: TodoItem): void {
    this.service.update(data, item);
  }

  deleteItem(item: TodoItem): void {
    this.service.delete(item);
  }

  tasksToFinish(items: readonly TodoItem[]) {
    let nb = 0;
    items.forEach((element) => {
      if (element.isDone == false) {
        nb++;
      }
    });
    return nb;
  }

  supprimerCochees(items: readonly TodoItem[]) {
    items.forEach((element) => {
      if (element.isDone == true) {
        this.deleteItem(element);
      }
    });
  }

  checklistItems(items: readonly TodoItem[]) {
    let nbRemaining;
    this.serviceExtended.subscribe((e) => (nbRemaining = e.remaining));

    if (nbRemaining === 0) {
      items.forEach((element) => {
        this.updateItem({ isDone: false }, element);
      });
    } else {
      items.forEach((element) => {
        this.updateItem({ isDone: true }, element);
      });
    }
  }

  filterAll(): void {
    this.currentFilter.next(this.fAll);
  }

  filterCompleted(): void {
    this.currentFilter.next(this.fCompleted);
  }

  filterActive(): void {
    this.currentFilter.next(this.fNotCompleted);
  }
}
