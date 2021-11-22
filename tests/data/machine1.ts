export function jsonFormat() {
  return {
    id: '1',
    type: 'machine',
    attributes: {
      foo: 1
    }
  }
}

export function normFormat() {
  return {
    foo: 1,
    _jp: {
      type: 'machine',
      id: '1'
    }
  }
}
