import DefaultLayout from '~/layouts/Default.vue'
// main.js or app.js


import { faGithub, faTwitter, faDiscord, faJs, faHtml5, faCss3, faNode, faLinkedin, faDocker, faPython, faAws, faDigitalOcean } from '@fortawesome/free-brands-svg-icons'
import { faAt, faDatabase, faBars, faLink, faEye } from '@fortawesome/free-solid-svg-icons'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default function (Vue) {

  library.add(faGithub, faDiscord, faHtml5, faDocker, faPython, faAws, faJs, faDigitalOcean, faCss3, faNode, faLinkedin, faAt, faDatabase, faBars, faLink, faEye)

  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
  Vue.component('AppIcon', FontAwesomeIcon)
}
