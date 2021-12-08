import { Component } from '@angular/core';
import { DataService } from '../data.service';

export class User {
  public age: number

  constructor(
    public id: string,
    public email: string,
    public birth_date: string,
    public groupId: string,
  ) {
    this.age = this.getAge(birth_date);
  }

  
  getAge(dateString: string) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})


export class UsersComponent {
  users: User[] = [];
  youngestUser: User;
  oldestUser: User;
  averageAge: number;

  constructor(private  dataService : DataService) { }

  clearUsers(): void {
    this.users = [];
  }

  getUsers(groupId: string): void {
      this.dataService.getUsers(groupId).subscribe((data: any) => {
      console.log(data);
      this.users = [];
      let mapedUsers = data as User[];
      mapedUsers.forEach(item => this.users.push(new User(item.id, item.email, item.birth_date, item.groupId)));
      this.youngestUser = this.getYoungestUser();
      this.oldestUser = this.getOldestUser();
      this.averageAge = this.getAverageAge();
    })
  }

  getYoungestUser(): User {
    return this.users?.reduce(function (prev: User, current: User) {
      return (prev.age < current.age) ? prev : current
    })
  }

  getOldestUser(): User {
    return this.users?.reduce(function (prev: User, current: User) {
      return (prev.age > current.age) ? prev : current
    })
  }

  
  getAverageAge() {
    let reducer = (total: number, currentValue: number) => total + currentValue;
    let sum = this.users.map(u => u.age).reduce(reducer);
    return Math.round(sum / this.users.length);
  }
}
