import { Page } from 'page-objects/page'

class HomePage extends Page {
  open() {
    return super.open('/')
  }

  openLink(link) {
    return super.open(link)
  }
}

export default new HomePage()
