<template>
  <Layout>
    <transition name="fade" appear>
      <main class="mt-1 mb-14">
        <div class="contain flex flex-col gap-7">
          <h1 ref="animatedName" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave" class="font-semibold text-2xl">
            {{ animatedText }}
          </h1>
          <p class="text-dimGrey leading-8">
            I'm a Backend and Cloud Engineer who thrives to craft solutions that are both simple and elegant.
            Currently learning and working on Cloud Native and web technologies, I have a strong foundation in <span class="text-border">AWS</span>, <span class="text-border">Python</span>. 
            I'm always looking to learn and collaborate on challenging projects.
          </p>
          <Email :loopMessage="true" />
        </div>

        <!-- Work Experience Section -->
        <div class="contain mt-16 flex flex-col gap-3">
          <h2 class="text-2xl dhing">Projects</h2>
          <tabs :mode="mode">
            <tab title="Nextform" position="Serverless web-form app" company="NextForm" companyURL="https://nextf0rm.vercel.app/" :itemList="nextItemList"/>
            <tab title="FileWizard" position="Seamless File Conversion Webapp" company="FileWizard" companyURL="https://filewizard.vercel.app/" :itemList="fwItemList"/>
            <tab title="Pwnagotchi" position="Raspberry Pi pentesting device" company="Pwnagotchi" companyURL="https://github.com/SourasishBasu/Pwnagotchi-raspberry-pi0" :itemList="pwItemList"/>
          </tabs>

          <div style="margin-top: 10px; align-self: flex-start; display: flex; align-items: flex-end;">
            <button style="background-color: #00B300; border: none; color: black; padding: 10px 20px; text-align: center; text-decoration: none; font-size: 16px; cursor: pointer;">
              <a href="https://drive.google.com/file/d/1MjfRNqZZC0wZpOTCUCzSpph0Bmlgexmg/view" style="color: black; text-decoration: none;">Download Full CV</a>
            </button>   
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
        'Implemented a RESTful API to validate user input and send SMS notifications using Lambda,DynamoDB, EventBridge and SNS',
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
      animatedText: 'Hi, I\'m Sourasish Basu',
      isAnimating: false,
      intervalId: null,
      originalText: 'Hi, I\'m Sourasish Basu'
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
    startAnimation() {
      this.isAnimating = true;
      setTimeout(() => {
        this.isAnimating = false;
      }, 1700); 
    },
    handleMouseOver() {
      if (this.isAnimating) return;

      let iteration = 0;

      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }

      const scramble = () => {
        this.isAnimating = true;
        this.animatedText = this.animatedText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return char;
            }
            return String.fromCharCode(65 + Math.floor(Math.random() * 26));
          })
          .join('');

        if (iteration < this.animatedText.length) {
          iteration += 1 / 3;
          this.intervalId = setTimeout(scramble, 30);
        } else {
          this.isAnimating = false;
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
    },
    handleMouseLeave() {
      clearInterval(this.intervalId);
      this.isAnimating = false;
      this.animatedText = this.originalText;
    }
  },
  mounted() {
    this.$refs.animatedName.addEventListener('mouseover', this.handleMouseOver);
    this.$refs.animatedName.addEventListener('mouseleave', this.handleMouseLeave);
  },
  beforeDestroy() {
    this.$refs.animatedName.removeEventListener('mouseover', this.handleMouseOver);
    this.$refs.animatedName.removeEventListener('mouseleave', this.handleMouseLeave);
    clearInterval(this.intervalId);
  }
};
</script>

<style>

.dhing{
  font-family: 'PexicoMicro-Regular';
  color: #52fe6f;
}

::selection {
  color: black;
  background: #2BBC89;
}

.wave:hover {
  animation-play-state: running;
}

.wave.running {
  animation-play-state: running;
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
