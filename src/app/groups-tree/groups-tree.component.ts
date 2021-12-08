import { CollectionViewer, SelectionChange, DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataService } from '../data.service';
import { UsersComponent } from '../users/users.component';

export class DynamicFlatNode {
  constructor(
    public item: ListNode,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ) { }
}

export class ListNode {
  constructor(
    public id: string,
    public name: string,
    public parent_id: string,
    public has_children: boolean
  ) { }
}

@Injectable({ providedIn: 'root' })
export class DynamicDatabase {

  dataMap = new Map<ListNode, ListNode[]>([
  ]);

  rootLevelNodes: ListNode[] = [];

  initialData(rootLevelNodes: ListNode[], root: ListNode): DynamicFlatNode[] {
    this.rootLevelNodes = rootLevelNodes;
    this.dataMap.set(root, rootLevelNodes);
    return this.rootLevelNodes.map(name => new DynamicFlatNode(name, 0, true));
  }

  getChildren(node: ListNode): ListNode[] | undefined {
    return this.dataMap.get(node);
  }

  isExpandable(node: ListNode): boolean {
    return this.dataMap.has(node);
  }
}

export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DynamicDatabase,
    private _dataService: DataService
  ) { }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void { }

  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  toggleNode(node: DynamicFlatNode, expand: boolean) {
    let children: ListNode[];
    let index = 0;
    this._dataService.getGroups(node.item.id).subscribe(async (data: any) => {
      this._database.initialData(data, node.item);
      children = this._database.getChildren(node.item) ?? [];
      index = this.data.indexOf(node);
      if (!children || index < 0) {
        return;
      }
      node.isLoading = true;
    });

    setTimeout(() => {
      if (expand) {
        const nodes = children.map(
          name => new DynamicFlatNode(name, node.level + 1, this._database.isExpandable(name)),
        );
        this.data.splice(index + 1, 0, ...nodes);
      } else {
        let count = 0;
        for (
          let i = index + 1;
          i < this.data.length && this.data[i].level > node.level;
          i++, count++
        ) { }
        this.data.splice(index + 1, count);
      }

      this.dataChange.next(this.data);
      node.isLoading = false;
    }, 1000);

  }
}

@Component({
  selector: 'app-groups-tree',
  templateUrl: './groups-tree.component.html',
  styleUrls: ['./groups-tree.component.css']
})
export class GroupsTreeComponent {
  database: DynamicDatabase;

  loadUsers: boolean;
  @ViewChild(UsersComponent, { static: false }) usersComponent: UsersComponent;
  constructor(private dataService: DataService) {
    this.database = new DynamicDatabase();
    this.loadUsers = false;
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, this.database, this.dataService);
    let root = new ListNode("1", "Root", "null", true);
    this.activeNode = new DynamicFlatNode(root, 0, false, false);
    this.dataService.getGroups("1").subscribe((data: any) => {
      this.dataSource.data = this.database.initialData(data, root);
    })
  }

  selectNode(event: any, node: DynamicFlatNode) {
    this.activeNode = node;
    this.loadUsers = true;
    const parent = event.target.parentNode;
    this.usersComponent.getUsers(this.activeNode.item.id);
  }

  expandNode(event: any, node: DynamicFlatNode) {
    if (this.treeControl.isExpanded(node)) {
      this.selectNode(event, node);
    } else {
      this.activeNode = new DynamicFlatNode(
        new ListNode("1", "Root", "null", true), 0, false, false);
      this.loadUsers = false;
      this.usersComponent.clearUsers();
    }
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  activeNode: DynamicFlatNode;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;
}

