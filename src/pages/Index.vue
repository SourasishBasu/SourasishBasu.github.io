<template>
  <Layout>
    <transition name="fade" appear>
      <main class="mt-1 mb-14">
        <div class="contain flex flex-col gap-7">
          <h1 ref="animatedName" class="font-semibold text-2xl dhing">
            {{ animatedText }}
          </h1>
          <p class="text-dimGrey leading-8 bhing">
            I'm a Backend and Cloud Engineer who thrives to craft solutions that are both simple and elegant.
            Currently learning and working on Cloud Native and web technologies, I have a strong foundation in <span class="text-border">AWS</span>, <span class="text-border">Python</span>. 
            I'm always looking to learn and collaborate on challenging projects.
          </p>
          <Email :loopMessage="true" />
        </div>

        <!-- Work Experience Section -->
        <div class="contain mt-16 flex flex-col gap-3 dhing">
          <h2 class="text-2xl dhing" style="color:#52fe6f">Projects</h2>
          <tabs :mode="mode">
            <tab title="Nextform" position="Serverless web-form app" company="NextForm" companyURL="https://nextf0rm.vercel.app/" :itemList="nextItemList"/>
            <tab title="FileWizard" position="Seamless File Conversion Webapp" company="FileWizard" companyURL="https://filewizard.vercel.app/" :itemList="fwItemList"/>
            <tab title="Pwnagotchi" position="Raspberry Pi pentesting device" company="Pwnagotchi" companyURL="https://github.com/SourasishBasu/Pwnagotchi-raspberry-pi0" :itemList="pwItemList"/>
          </tabs>

          <div class="wrap bhing">
            <a href="https://drive.google.com/file/d/1MjfRNqZZC0wZpOTCUCzSpph0Bmlgexmg/view" target="_blank"> 
              <button class="btn" id="btn1">View Resume</button>  
              <button class="btn" id="btn2"></button>  
            </a>
          </div>
        </div>
      </main>
    </transition>
  </Layout>
</template>

<script>
import Tab from '../components/Tab.vue'
import Tabs from '../components/Tabs.vue'
import Email from '../components/Email.vue'
export default {
  metaInfo: {
    title: "Sourasish Basu",
  },
  components: {
    Tab,
    Tabs,
    Email
  },
  data () {
    return {
      mode: 'dark',
      nextItemList: [
        'A serverless web-form app built with NextJS, Express running on AWS to send automated confirmation messages upon signup',
        'Implemented a RESTful API to validate user input and send SMS notifications using Lambda, DynamoDB, EventBridge and SNS',
        'Demonstrated proficiency in CI/CD, and automated testing with GitHub Actions, NextJS, and Python'
      ],
      fwItemList: [
        'Simplified and maintained an open-source file converter web application, on AWS using Next.js, Docker, and Python',
        'Enabled seamless conversion for various formats [.jpg, .png, .pdf, .docx] with a focus on performance and security',
        'Led the end-to-end development, and maintenance of Flask microservices to optimize transfer, storage, conversion of files'
      ],
      pwItemList: [
        'AI powered Raspberry Pi ZeroWH network pentesting device with a user-friendly interface',
        'Utilized machine learning to optimize attacks to capture WPA handshakes, conduct deauth attacks while passively monitoring Wi-Fi networks',
        'Monitored and analyzed network traffic, identifying vulnerabilities and providing real-time alerts to the user',
      ],
      animatedText: "Hi, I'm Sourasish Basu",
      isAnimating: false,
      intervalId: null,
      letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      originalText: "Hi, I'm Sourasish Basu"
    }
  },
  methods: {
    changeStyle () {
      if (this.mode === 'dark') {
        this.mode = 'light'
      } else {
        this.mode = 'dark'
      }
    },
    
    handleMouseOver() {
      if (this.isAnimating) return;

      let iteration = 0;

      if (this.intervalId !== null) {
        clearTimeout(this.intervalId);
      }

      const scramble = () => {
        this.isAnimating = true;
        this.animatedText = this.animatedText
          .split('')
          .map((_, index) => {
            if (index < iteration) {
              return this.animatedText[index];
            }
            return this.letters[Math.floor(Math.random() * 26)];
          })
          .join('');

        if (iteration < this.animatedText.length) {
          iteration += 1 / 3;
          this.intervalId = setTimeout(scramble, 30);
        } else {
          this.unscrambleText();
        }
      };

      scramble();
    },
    unscrambleText() {
      let iteration = 0;

      const unscramble = () => {
        this.isAnimating = true;
        this.animatedText = this.originalText.slice(0, iteration) + this.animatedText.slice(iteration);

        if (iteration < this.originalText.length) {
          iteration++;
          this.intervalId = setTimeout(unscramble, 30);
        } else {
          this.isAnimating = false;
        }
      };

      unscramble();
    }
  },
  mounted() {
    this.$refs.animatedName.addEventListener('mouseover', this.handleMouseOver);
  },
  beforeDestroy() {
    this.$refs.animatedName.removeEventListener('mouseover', this.handleMouseOver);
    clearTimeout(this.intervalId);
  }
};
</script>

<style>

.dhing{
  font-family: 'PexicoMicro-Regular';
}

.bhing{
  font-family: 'Mabry Pro';
  font-size: 1.2rem;
}

::selection {
  color: black;
  background: #2BBC89;
}

.wrap {
  padding-top: 20px;
  position: relative;
  display: flex;
  justify-content: left;
  align-items: center;
  padding-bottom: 20px;
}

.wrap a {
  height:100%;
  display: flex;
  justify-content: left;
  align-items: left;
}

.wrap .btn {
  position: absolute;
  width: 190px;
  height: 50px;
  color: black;
  font-size: 1.4rem;
  border: solid 2px black;
  border-radius: 4px;
}

.wrap #btn1 {
  background: #38ef7d;
  text-align: center;
  z-index: 3;
}

.wrap #btn2 {
  background: #C9CACC;
  z-index: 2;
}

/* Adjust the hover effect */

.wrap a .btn {
  transform: translateX(0%) translateY(0%);
  transition: 0.3s ease-in-out;
}

.wrap a:hover #btn1 {
  transform: translateX(-5%) translateY(-24%);
  transition: 0.3s ease-in-out;
}

.wrap a:hover #btn2 {
  transform: translateX(-2%) translateY(-12%);
  transition: 0.3s ease-in-out;
}

@font-face {
  font-family: "PexicoMicro-Regular";
  src: url("https://db.onlinewebfonts.com/t/852be80a3188170a0c4ebb2534efb54d.eot");
  src: url("https://db.onlinewebfonts.com/t/852be80a3188170a0c4ebb2534efb54d.eot?#iefix")
      format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/852be80a3188170a0c4ebb2534efb54d.woff2")
      format("woff2"),
    url("https://db.onlinewebfonts.com/t/852be80a3188170a0c4ebb2534efb54d.woff")
      format("woff"),
    url("https://db.onlinewebfonts.com/t/852be80a3188170a0c4ebb2534efb54d.ttf")
      format("truetype"),
    url("https://db.onlinewebfonts.com/t/852be80a3188170a0c4ebb2534efb54d.svg#PexicoMicro-Regular")
      format("svg");
}

      @font-face {
    /* rubik-latin-wght-normal */
    font-family: 'Rubik Variable';
    font-style: normal;
    font-display: swap;
    font-weight: 300 900;
    src: url(https://cdn.jsdelivr.net/fontsource/fonts/rubik:vf@latest/latin-wght-normal.woff2) format('woff2-variations');
    unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}

@font-face {
    font-family: "Mabry Pro";
    src: url("../fonts/MabryPro-Regular.woff2")format("woff2"),
    url("../fonts/MabryPro-Regular.woff")format("woff"),
    url("../fonts/MabryPro-Regular.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/fc0ba89248939ae27a47ce54c1f44737.svg#Mabry Pro")format("svg");
}
</style>

<page-query>
query {
  posts: allArticles(perPage: 3) {
    edges {
      node {
        id
        title
        path
        date
      }
    }
  }
}
</page-query>
