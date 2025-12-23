export class Dates {
  updateValidDates(obj) {
    const validFrom = new Date()
    validFrom.setHours(0, 0, 0, 0)
    const validTo = new Date(validFrom)
    validTo.setFullYear(validTo.getFullYear() + 1)

    function traverse(item) {
      if (item === null || typeof item !== 'object') {
        return
      }
      if (Array.isArray(item)) {
        item.forEach(traverse)
        return
      }
      if (Object.prototype.hasOwnProperty.call(item, 'validTo')) {
        item.validTo = validTo.toISOString()
      }

      Object.values(item).forEach(traverse)
    }
    traverse(obj)
  }
}
