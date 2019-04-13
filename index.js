// Get type of element.
function getType(value) {
  if (typeof value === "object") {
    switch (Object.prototype.toString.call(value)) {
      case "[object Object]":
        return "object";
      case "[object Array]":
        return "array";
      case "[object Map]":
        return "map";
      case "[object Set]":
        return "set";
      case "[object WeakMap]":
        return "weakmap";
      case "[object WeakSet]":
        return "weakset";
      case "[object Function]":
        return "function";
      case "[object Null]":
        return "null";
      case "[object Error]":
        return "error";
      case "[object Date]":
        return "date";
      default:
        return "object";
    }
  }
  return typeof value;
}

// Compare two elements and all of its children, return true if both are same.
function compare(element1, element2) {
  if (getType(element1) !== getType(element2)) {
    return false;
  }
  const type = getType(element1);
  switch (type) {
    case "map":
      return compareMaps(element1, element2);
    case "object":
      return compareObjects(element1, element2);
    case "array":
      return compareArrays(element1, element2, true);
    default:
      if (element1 !== element2) {
        return false;
      }
      break;
  }
  return true;
}

// Compare two objects and all of it's children, returns true if both are same.
function compareObjects(objectOne, objectTwo) {
  var objectOneKeys = Object.keys(objectOne);
  var objectTwoKeys = Object.keys(objectTwo);
  if (
    getType(objectOne) !== "object" ||
    getType(objectTwo) !== "object" ||
    objectOneKeys.length !== objectTwoKeys.length
  ) {
    return false;
  }
  for (var key of objectOneKeys) {
    const type = getType(objectOne[key]);
    switch (type) {
      case "object":
        return compareObjects(objectOne[key], objectTwo[key]);
      case "map":
        return compareMaps(objectOne[key], objectTwo[key]);
      case "array":
        return compareArrays(objectOne[key], objectTwo[key], true);
      default:
        if (objectOne[key] !== objectTwo[key]) {
          return false;
        }
        break;
    }
  }
  return true;
}

// Compare two Maps and all of it's children, returns true if both are same.
function compareMaps(mapOne, mapTwo) {
  if (
    getType(mapOne) !== "map" ||
    getType(mapTwo) !== "map" ||
    mapOne.size !== mapTwo.size
  ) {
    return false;
  }
  for (var [key, value] of mapOne) {
    const type = getType(value);
    switch (type) {
      case "map":
        return compareMaps(value, mapTwo.get(key));
      case "object":
        return compareObjects(value, mapTwo.get(key));
      case "array":
        return compareArrays(value, mapTwo.get(key), true);
      default:
        if (value !== mapTwo.get(key)) {
          return false;
        }
        break;
    }
  }
  return true;
}

// Compare two Arrays and all of it's children, returns true if both are same.
function compareArrays(arrayOne, arrayTwo, shouldSort = false) {
  if (
    getType(arrayOne) !== "array" ||
    getType(arrayTwo) !== "array" ||
    arrayOne.length !== arrayTwo.length
  ) {
    return false;
  }
  if (shouldSort) {
    arrayOne.sort();
    arrayTwo.sort();
  }
  for (var key in arrayOne) {
    var type = getType(arrayOne[key]);
    switch (type) {
      case "object":
        return compareObjects(arrayOne[key], arrayTwo[key]);
      case "map":
        return compareMaps(arrayOne[key], arrayTwo[key]);
      case "array":
        return compareArrays(arrayOne[key], arrayTwo[key], shouldSort);
      default:
        if (arrayOne[key] !== arrayTwo[key]) {
          return false;
        }
        break;
    }
  }
  return true;
}

function unique(array, isSorted = false, key) {
  var type = getType(array[0]);
  var result = [];
  switch (type) {
    case "object":
      return uniqueObjects(array, isSorted, key);
    case "map":
      return uniqueMaps(array, isSorted, key);
    default: {
      if (!isSorted) {
        array.sort();
      }
      array.forEach((item, index) => {
        if (index !== array.length - 1 && !compare(item, array[index + 1])) {
          result.push(item);
        }
      });
      result.push(array[array.length - 1]);
    }
  }
  return result;
}

function uniqueObjects(array, isSorted, key) {
  if (!isSorted) {
    array.sort((x, y) => {
      if (x[key] > y[key]) {
        return 1;
      } else if (x[key] < y[key]) {
        return -1;
      }
      return 0;
    });
  }
  var result = [];
  array.forEach((item, index) => {
    if (
      index !== array.length - 1 &&
      !compare(item[key], array[index + 1][key])
    ) {
      result.push(item);
    }
  });
  result.push(array[array.length - 1]);
  return result;
}

function uniqueMaps(array, isSorted, key) {
  if (!isSorted) {
    array.sort((x, y) => {
      if (x.get(key) > y.get(key)) {
        return 1;
      } else if (x.get(key) < y.get(key)) {
        return -1;
      }
      return 0;
    });
  }
  var result = [];
  array.forEach((item, index) => {
    if (
      index !== array.length - 1 &&
      !compare(item.get(key), array[index + 1].get(key))
    ) {
      result.push(item);
    }
  });
  result.push(array[array.length - 1]);
  return result;
}

function flatten(value, shallow = false) {
  const type = getType(value);
  switch (type) {
    case "array":
      return flattenArray(value, shallow);
    case "object":
      return flattenObject(value, shallow);
    case "map":
      return flattenMap(value, shallow);
    default:
      return null;
  }
}

function flattenArray(arr, isShallow = false) {
  var checkObj = {};
  var flattenArr = function(array, shallow = false, shallowIndex) {
    var result = [];
    array.forEach((item, index) => {
      var type = getType(item);
      if (type === "array" && (!shallow || !checkObj[shallowIndex])) {
        if (shallow) {
          checkObj[index] = true;
        }
        result = result.concat(flattenArr(item, shallow, index));
      } else {
        result.push(item);
      }
    });
    return result;
  };
  return flattenArr(arr, isShallow);
}

function flattenObject(obj, isShallow = false) {
  var checkObj = {};
  var flattenObj = function(object, shallow, shallowIndex) {
    var result = {};
    Object.keys(object).forEach((key, index) => {
      var type = getType(object[key]);
      if (type === "object" && (!shallow || !checkObj[shallowIndex])) {
        if (shallow) {
          checkObj[index] = true;
        }
        result = Object.assign(result, flattenObj(object[key], shallow, index));
      } else {
        result[key] = object[key];
      }
    });
    return result;
  };
  return flattenObj(obj, isShallow);
}

function flattenMap(mp, isShallow = false) {
  var checkObj = {};
  var flattenMp = function(map, shallow, shallowKey) {
    var result = new Map();
    for (var [key, value] of map) {
      var type = getType(value);
      if (type === "map" && (!shallow || !checkObj[shallowKey])) {
        if (shallow) {
          checkObj[key] = true;
        }
        result = new Map([...result, ...flattenMp(value, isShallow, key)]);
      } else {
        result.set(key, value);
      }
    }
    return result;
  };
  return flattenMp(mp, isShallow);
}

function getKey(arrays) {
  if (arrays.length > 0 && typeof arrays[arrays.length - 1] === "string") {
    return arrays[arrays.length - 1];
  }
  return null;
}

function union(...arrays) {
  var key = getKey(arrays);
  var onlyArrays = key ? arrays.slice(0, arrays.length -1) : arrays;
  return unique(flatten(onlyArrays, true), false, key);
}

function difference(array, ...arrays) {
  var type = getType(array[0]);
  switch (type) {
    case "object":
      return differenceObjects(array, arrays);
    case "map":
      return differenceMaps(array, arrays);
    default: {
      arrays = flatten(arrays);
      return array.filter(i => !Boolean(arrays.indexOf(i) > -1));
    }
  }
}

function differenceObjects(array, ...arrays) {
  arrays = flatten(arrays);
  var key = getKey(arrays);
  var onlyArrays = key ? arrays.slice(0, arrays.length - 1) : arrays;
  var filteredArrays = onlyArrays.map(i => i[key]);
  return array.filter(i => !Boolean(filteredArrays.indexOf(i[key]) > -1));
}

function differenceMaps(array, ...arrays) {
  arrays = flatten(arrays);
  var key = getKey(arrays);
  var onlyArrays = key ? arrays.slice(0, arrays.length - 1) : arrays;
  var filteredArrays = onlyArrays.map(i => i.get(key));
  return array.filter(i => !Boolean(filteredArrays.indexOf(i.get(key)) > -1));
}

function without(array, ...arrays) {
  var type = getType(array[0]);
  switch (type) {
    case "object":
      return withoutObjects(array, arrays);
    case "map":
      return withoutMaps(array, arrays);
    default: {
      arrays = flatten(arrays);
      return array.filter(i => !Boolean(arrays.indexOf(i) > -1));
    }
  }
}

function withoutObjects(array, ...arrays) {
  arrays = flatten(arrays);
  var key = getKey(arrays);
  var onlyArrays = key ? arrays.slice(0, arrays.length - 1) : arrays;
  return array.filter(i => !Boolean(onlyArrays.indexOf(i[key]) > -1));
}

function withoutMaps(array, ...arrays) {
  arrays = flatten(arrays);
  var key = getKey(arrays);
  var onlyArrays = key ? arrays.slice(0, arrays.length - 1) : arrays;
  return array.filter(i => !Boolean(onlyArrays.indexOf(i.get(key)) > -1));
}

function intersection(arrayOne, arrayTwo, key) {
  const type = getType(arrayOne[0]);
  switch (type) {
    case "object":
      return intersectionObjects(arrayOne, arrayTwo, key);
    case 'map':
      return intersectionMaps(arrayOne, arrayTwo, key);
    default:
      return arrayOne.filter(i => Boolean(arrayTwo.indexOf(i) > -1));
  }
}

function intersectionObjects(arrayOne, arrayTwo, key) {
  const arrayToCompare = arrayTwo.map(i => i[key]);
  return arrayOne.filter(i => Boolean(arrayToCompare.indexOf(i[key]) > -1));
}

function intersectionMaps(arrayOne, arrayTwo, key) {
  const arrayToCompare = arrayTwo.map(i => i.get(key));
  return arrayOne.filter(i => Boolean(arrayToCompare.indexOf(i.get(key)) > -1));
}

function last(array) {
  return array[array.length - 1];
}

function rest(array, index) {
  return array.slice(index, array.length);
}

function until(array, index) {
  return array.slice(0, index + 1);
}

function getIndex(value, array, occurance = "all") {
  switch (occurance) {
    case "last": {
      for (var idx = array.length - 1; idx >= 0; idx--) {
        if (compare(array[idx], value)) {
          return idx;
        }
      }
      return -1;
    }
    case "all": {
      var occurances = [];
      array.forEach((item, index) => {
        if (compare(item, value)) {
          occurances.push(index);
        }
      });
      return occurances;
    }
    default: {
      var first = -1;
      array.every((item, index) => {
        if (compare(item, value)) {
          first = index;
          return false;
        }
        return true;
      });
      return first;
    }
  }
}

function compact(array, flag = "false") {
  switch (flag) {
    case "false":
      return array.filter(i => i);
    case "empty":
      var nonEmpty = array.filter(i => {
        var type = getType(i);
        switch (type) {
          case "object":
            return Boolean(Object.keys(i).length > 0);
          case "map":
            return Boolean(i.size > 0);
          case "array":
            return Boolean(i.length > 0);
          case "set":
            return Boolean(i.size > 0);
          case "string":
            return Boolean(i.length > 0);
          case "number":
            return Boolean(!isNaN(i));
          default:
            return true;
        }
      });
      return nonEmpty;
    default:
      return array.filter(i => i);
  }
}

function map(iteratee, func) {
  var result = [];
  var length = iteratee.length - 1;
  for (var idx = 0; idx <= length; idx++) {
    result.push(func(iteratee[idx], idx));
  }
  return result;
}

module.exports = {
  getType,
  compare,
  compareObjects,
  compareMaps,
  compareArrays,
  unique,
  uniqueObjects,
  uniqueMaps,
  flatten,
  flattenArray,
  flattenObject,
  flattenMap,
  union,
  difference,
  differenceObjects,
  differenceMaps,
  without,
  withoutObjects,
  withoutMaps,
  intersection,
  intersectionObjects,
  intersectionMaps,
  last,
  rest,
  until,
  getIndex,
  compact,
  map
};
