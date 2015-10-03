/* @flow */

import * as TaskModule from "./task"

const {succeed, perform, send, io, future, Task: TaskType} = TaskModule

/*::
import type {Address} from "./signal"
*/

// A type that is "uninhabited". There are no values of type `Never`, so if
// something has this type, it is a guarantee that it can never happen. It is
// useful for demanding that a `Task` can never fail.
export class Never {}

// The simplest effect of them all: don’t do anything! This is useful when
// some branches of your update function request effects and others do not.
export class None {
  /*::
  $typeof: "Effects.None";
  */
  constructor() {
    this.$typeof = "Effects.None"
  }
  map/*::<a,b>*/(f/*:(a:a)=>b*/)/*:None*/ {
    return none
  }
  send(address/*:Address<any>*/) /*:TaskType<Never,void>*/ {
    return succeed()
  }
}

export const none = new None()

/*::
type Time = number
*/

export class Tick /*::<a>*/ {
  /*::
  tag: (time:Time) => a;
  $typeof: "Effects.Tick";
  */
  constructor(tag/*:(time:Time) => a*/) {
    this.tag = tag
    this.$typeof = "Effects.Tick"
  }
  map/*::<b>*/(f/*:(a:a)=>b*/)/*:Tick<b>*/ {
    return new Tick((time/*:Time*/) => f(this.tag(time)))
  }
  send(address/*:Address<a>*/)/*:TaskType<Never,void>*/ {
    return io(deliver => window.requestAnimationFrame(deliver))
              .map(this.tag)
              .chain((response/*:a*/) => send(address, response))
  }
}

export class Task /*::<a>*/ {
  /*::
  task: TaskType<Never,a>;
  $typeof: "Effects.Task";
  */
  constructor(task/*:TaskType<Never,a>*/) {
    this.task = task
    this.$typeof = "Effects.Task"
  }
  map/*::<b>*/(f/*:(a:a)=>b*/)/*:Task<b>*/ {
    return new Task(this.task.map(f))
  }
  send(address/*:Address<a>*/)/*:TaskType<Never,void>*/ {
    return this.task
               .chain(response => send(address, response))
  }
}

export class Batch /*::<a>*/ {
  /*::
  effects: Array<Effects<a>>;
  $typeof: "Effects.Batch";
  */
  constructor(effects/*:Array<Effects<a>>*/) {
    this.effects = effects
    this.$typeof = "Effects.Batch"
  }
  map/*::<b>*/(f/*:(a:a)=>b*/)/*:Batch<b>*/ {
    return new Batch(this.effects.map(effect => effect.map(f)))
  }
  send(address/*:Address<any>*/)/*:TaskType<Never,void>*/{
    return this.effects.reduce((task, effect) => {
      return task.chain(_ => effect.send(address))
    }, succeed())
  }
}

/*::
export type Effects <a>
  = None
  | Tick <a>
  | Task <a>
  | Batch <a>
*/


// export const map = /*::<a,b>*/(effects/*:Effects<a>*/, f/*:(a:a)=>b*/)/*:Effects<b>*/ =>
//   effects.map(f)

// Normally a `Task` has a error type and a success type. In this case the error
// type is `Never` meaning that you must provide a task that never fails. Lots of
// tasks can fail (like HTTP requests), so you will want to use `Task.toMaybe`
// and `Task.toResult` to move potential errors into the success type so they
// can be handled explicitly.
export const task = /*::<a>*/(task/*:TaskType<Never,a>*/)/*:Effects<a>*/ =>
  new Task(task)

// Request a clock tick for animations. This function takes a function to turn
// the current time into an `a` value that can be handled by the relevant
// component.
export const tick = /*::<a>*/(tag/*:(time:Time)=>a*/)/*:Effects<a>*/ =>
  new Tick(tag)

// Create a batch of effects. The following example requests two tasks: one
// for the user’s picture and one for their age. You could put a bunch more
// stuff in that batch if you wanted!
//
//  const init = (userID) => [
//    {id: userID, picture: null, age: null},
//    batch([getPicture(userID), getAge(userID)])
//  ]
//
export const batch = /*::<a>*/(effects/*:Array<Effects<a>>*/)/*:Effects<a>*/ =>
  new Batch(effects)


export const nofx = /*::<m, a>*/(update/*:(m:m, a:a)=>m*/)/*:(m:m, a:a)=>[m,Effects<a>]*/ =>
  (model/*:m*/, action/*:a*/)/*:[m, Effects<a>]*/ =>
    [update(model, action), none];


export const service = /*::<a>*/(address/*:Address<a>*/)/*:(fx:Effects<a>)=>void*/=> fx => {
  perform(fx.send(address))
}
