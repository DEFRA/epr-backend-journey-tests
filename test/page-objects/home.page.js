import { Page } from 'page-objects/page'

class HomePage extends Page {
  open() {
    return super.open('/')
  }
}

export default new HomePage()
