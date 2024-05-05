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
    <header
      :class="[showMenu ? 'hidden' : 'fixed']"
      class="
        transition
        ease-in
        duration-500
        h-32
        w-full
        bg-[#1D1F21]
        md:hidden
        top-28
        left-0
        right-0
      "
    >
    </header>
    <slot />

    <footer class="contain flex justify-between mb-5 text-sl text-dimGreyAlt">
    <p>
        <span>&copy; 2024 🚀</span>
    </p>
    
    <p style="text-align: right;">Contact Me:

        <a href="https://www.linkedin.com/in/sourasishbasu" target="_blank" style="margin-right: 10px;">
          <app-icon icon="fab fa-linkedin" size="xl"></app-icon>
        </a>

        <a href="https://github.com/sourasishbasu" target="_blank" style="margin-right: 10px;">
          <app-icon icon="fab fa-github" size="lg"></app-icon>
        </a>

        <a
          href="https://discordapp.com/users/524877465496190976"
          target="_blank"
          style="margin-right: 10px;">
          <app-icon icon="fab fa-discord" size="lg"></app-icon>
        </a>

        <a href="mailto:sourasishbasu06@gmail.com" style="margin-right: 10px;">
          <app-icon icon="at" size="lg"></app-icon>
        </a>
    </p>
</footer>

</footer>

  </div>
</template>

<script>
export default {
  data() {
    return {
      showMenu: true,
    };
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

.gradient-text {
    background: linear-gradient(90deg, #11998e, #38ef7d);
    background-size: 300%;
    /* Light to darker purple gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientAnimation 5s linear infinite alternate; /* Apply animation to the gradient */
}
</style>


<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>