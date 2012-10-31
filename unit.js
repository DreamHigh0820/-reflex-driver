"use strict";

var channel = require("reducers/channel")
var pipe = require("reducers/pipe")
var filter = require("reducers/filter")
var map = require("reducers/map")
var flatten = require("reducers/flatten")

var has = require("./util/has")
var field = require("./util/field")
var association = require("util/association")

var keys = Object.keys


function unit(mapping) {
  /**
  Takes mapping of JSON paths for a state snapshot and `reactor`-or functions
  (typically created via `unit` or `component`) to which state updates scoped
  to that entry are forwarded. In return `input` stream state changes caused
  by interactions to an enclosed entities is returned. The role of units is
  to structure components of the application in a logical forms that would
  map a state model.

  ## Example

      var reactor = unit({
        items: component(atom(itemWriter, itemReader)),
        count: component(atom(itemCountWriter))
      })
  **/
  return function reactor(source, options) {
    /**
    Function takes stream of state changes for the unit it's responsible
    and distributes change across nested components / units. As a return value
    it returns joined steam of changes caused by interactions on all nested
    components in same structure as stream of changes it reads from.
    If `
    **/

    // If `source` stream of state changes is not provided this means this
    // is reactor for top level unit. So all the change events generated by
    // it's entities will be all the application state changes, there for
    // channel for that changes is created.
    var changes = source || channel()
    var inputs = keys(mapping).map(function forkChanges(id) {
      var reactors = mapping[id]
      // Filter stream of changes to a stream of changes to the entity
      // with a given id.
      var entityChanges = filter(changes, has(id))
      // Map changes for the given entity to an actual change deltas
      var entityUpdates = map(entityChanges, field(id))

      // Turn reactors into their inputs
      var inputs = map(reactors, function (react) {
        // Get an user input for the component by passing scope updates to
        // the reactor function associated with an `id`.
        var input = react(entityUpdates, options)
        // Join back user input into same state structure.
        return map(input, association(id))
      })

      // Return joined stream of all inputs
      return flatten(inputs)
    })

    // Return joined stream of all inputs from all the entities of this
    // unit. Also if it's top level unit (`source` was not passed) pipe
    // state changes back to the application state changes as all the changes
    // are caused by it's entities.
    if (!source) pipe(flatten(inputs), changes)
    return source ? flatten(inputs) : changes
  }
}

module.exports = unit
