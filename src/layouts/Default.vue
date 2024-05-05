<template>
  <div>
    <header class="contain flex justify-between items-center h-40">
      <h1 class="text-4xl text-dimGrey font-bold gradient-text">
        <g-link to="/">Sasquatch</g-link>
      </h1>

      <nav class="hidden md:flex items-center gap-3 text-green">
        <g-link
          class="hover:underline text-xl border-r-2 border-dashed border-green pr-4"
          to="/"
          >Home</g-link
        >
        <g-link
          class="text-xl hover:underline"
          to="/articles/"
          >Articles</g-link
        >
      </nav>
      <div class="md:hidden block">
        <app-icon
          @click="
            () => {
              showMenu = !showMenu;
            }
          "
          class="cursor-pointer"
          icon="bars"
          size="lg"
        ></app-icon>
      </div>
    </header>

    <!-- Mobile Nav -->

    <header
      :class="[showMenu ? 'hidden' : 'fixed']"
      class="
        transition
        ease-in
        duration-500
        h-24
        w-full
        bg-black
        md:hidden
        top-28
        left-0
        right-0
        rounded-md
        border border-white
      "
    >
      <nav
        class="w-11/12 mx-auto flex flex-col items-end gap-3 pt-3" style="color: #a667f8;"
      >
        <g-link class="hover:underline" to="/">Home</g-link>
        <g-link class="hover:underline" to="/articles/">Articles</g-link>
      </nav>
    </header>

    <!-- Mobile Nav Ends -->

    <slot />

    <footer class="contain flex justify-between mb-5 text-sl text-dimGreyAlt">
      <p>
        <span>&copy; 2024</span>
      </p>
      
      <p style="text-align: right;">Contact Me:
        <a href="https://www.linkedin.com/in/sourasishbasu" target="_blank" style="margin-right: 10px;">
          <app-icon icon="fab fa-linkedin" size="xl" :style="{ color: linkedinColor }" @mouseenter="linkedinColor = '#0A66C2'" @mouseleave="linkedinColor = ''"></app-icon>
        </a>

        <a href="https://github.com/sourasishbasu" target="_blank" style="margin-right: 10px;">
          <app-icon icon="fab fa-github" size="lg" :style="{ color: githubColor }" @mouseenter="githubColor = '#FFF'" @mouseleave="githubColor = ''"></app-icon>
        </a>

        <a
          href="https://discordapp.com/users/524877465496190976"
          target="_blank"
          style="margin-right: 10px;">
          <app-icon icon="fab fa-discord" size="lg" :style="{ color: discordColor }" @mouseenter="discordColor = '#7289da'" @mouseleave="discordColor = ''"></app-icon>
        </a>

        <a href="mailto:sourasishbasu06@gmail.com" style="margin-right: 10px;">
          <app-icon icon="at" size="lg" :style="{ color: gmailColor }" @mouseenter="gmailColor = '#d93025'" @mouseleave="gmailColor = ''"></app-icon>
        </a>
      </p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showMenu: true,
      linkedinColor: '',
      githubColor: '',
      discordColor: '',
      gmailColor: '',
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>

<style>
@keyframes gradientAnimation {
    0% {
        background-position: 0 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0 50%;
    }
}

.gradient-text {
    background: linear-gradient(120deg, #11998e, #38ef7d, #93F9B9);
    background-size: 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientAnimation 5s linear infinite alternate; /* Apply animation to the gradient */
    white-space: nowrap;
}
</style>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>
