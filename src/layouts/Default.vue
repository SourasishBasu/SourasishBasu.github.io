<template>
  <div>
    <header class="contain flex justify-between items-center h-40">
      <h1 class="font-bold gradient-text" style="font-size: 2.5rem;">
        <g-link to="/">Sasquatch</g-link>
      </h1>

      <nav class="hidden md:flex items-center gap-3 text-green">
        <g-link
          class="nav-link text-xl border-r-2 border-dashed border-green pr-4 relative"
          :class="{
            'underline': $route.path === '/' || isHomeHovered,
            'no-underline': $route.path !== '/' && !isHomeHovered,
          }"
          to="/"
          @mouseover="isHomeHovered = true"
          @mouseleave="isHomeHovered = false"
        >
          Home
        </g-link>
        <g-link
          class="nav-link text-xl relative"
          :class="{
            'underline': $route.path === '/articles/' || isArticlesHovered,
            'no-underline': $route.path !== '/articles/' && !isArticlesHovered,
          }"
          to="/articles/"
          @mouseover="isArticlesHovered = true"
          @mouseleave="isArticlesHovered = false"
        >
          Articles
        </g-link>
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
        class="w-11/12 mx-auto flex flex-col items-center gap-3 pt-3"
        style="color: #a667f8;"
      >
        <g-link class="hover:underline" to="/">Home</g-link>
        <g-link class="hover:underline" to="/articles/">Articles</g-link>
      </nav>
    </header>

    <!-- Mobile Nav Ends -->

    <slot />

    <footer
      class="contain flex justify-between mb-5 text-base text-dimGreyAlt"
      style="padding-top: 30px"
    >
      <p>
        <span style="color: #c9cacc;">&copy; 2024 sourasish.basu</span>
      </p>

      <p style="text-align: right;">
        <span style="color: #c9cacc;">Contact Me: </span>
        <a
          href="https://www.linkedin.com/in/sourasishbasu"
          target="_blank"
          style="margin-right: 10px;"
        >
          <app-icon
            icon="fab fa-linkedin"
            size="xl"
            :style="{ color: linkedinColor }"
            @mouseenter="linkedinColor = '#0A66C2'"
            @mouseleave="linkedinColor = ''"
          ></app-icon>
        </a>

        <a
          href="https://github.com/sourasishbasu"
          target="_blank"
          style="margin-right: 10px;"
        >
          <app-icon
            icon="fab fa-github"
            size="lg"
            :style="{ color: githubColor }"
            @mouseenter="githubColor = '#FFF'"
            @mouseleave="githubColor = ''"
          ></app-icon>
        </a>

        <a
          href="https://discordapp.com/users/524877465496190976"
          target="_blank"
          style="margin-right: 10px;"
        >
          <app-icon
            icon="fab fa-discord"
            size="lg"
            :style="{ color: discordColor }"
            @mouseenter="discordColor = '#7289da'"
            @mouseleave="discordColor = ''"
          ></app-icon>
        </a>

        <a href="mailto:sourasishbasu06@gmail.com" style="margin-right: 10px;">
          <app-icon
            icon="at"
            size="lg"
            :style="{ color: gmailColor }"
            @mouseenter="gmailColor = '#d93025'"
            @mouseleave="gmailColor = ''"
          ></app-icon>
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
      isHomeHovered: false,
      isArticlesHovered: false,
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
  },
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

.g-link {
  text-decoration: none;
}

.gradient-text {
  background: linear-gradient(120deg, #11998e, #38ef7d, #93f9b9);
  background-size: 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientAnimation 5s linear infinite alternate; /* Apply animation to the gradient */
  white-space: pre;
}

.nav-link {
  position: relative;
  color: inherit;
}

.underline::after {
  text-decoration:underline;
}

.no-underline::after {
  text-decoration:underline;

}
</style>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>