<template>
  <div class='tab' v-show='isActive'>
    <slot></slot>
    <div style="padding-bottom: 20px;">
      <h2 style="font-weight: bold; font-size:1.2rem; padding-bottom: 20px;"><span>{{ position }} </span>
        <span 
          ref="companyLink"
          @mouseover="showImage(company)"
          @mouseleave="hideImage"
          class="decoration-cuppy underline underline-offset-4"
          :href="companyURL"
          rel="noopener noreferrer"
          target="_blank"
          style="cursor: pointer;"
        >
          @{{ company }}
        </span>
      </h2>                
      <div>
        <ul style="list-style-type: disc;">
          <li v-for="(item, index) in itemList" :key="index" style="font-size: 1.1rem; color: #C9CACC; margin-bottom: 20px; line-height: 2.0;">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Tab'
    },
    position: {
      type: String,
      default: 'Engineer'
    },
    company: {
      type: String,
      default: null
    },
    companyURL: {
      type: String,
      default: null
    },
    itemList: {
      type: Array,
      default: function() { return []; }
    }
  },
  methods: {
    showImage(company) {
      const imageSrc = this.getImageUrl(company);
      if (!imageSrc) return;
      const image = document.createElement('img');
      image.src = imageSrc;
      image.style.position = 'absolute';
      image.style.zIndex = '9999';
      image.style.pointerEvents = 'none'; // Ensure the image doesn't interfere with mouse events
      image.classList.add('image-style');

      image.onerror = () => {
        console.error('Error loading image:', imageSrc);
      };
      document.body.appendChild(image);

      // Apply fade in effect using CSS transition
      image.style.opacity = 0;
      setTimeout(() => {
        image.style.opacity = 1;
      }, 10); // Delaying to ensure opacity change triggers the transition

      // Store the image element in the component's data
      this.image = image;

      // Listen for mousemove event to update image position
      document.addEventListener('mousemove', this.updateImagePosition);
    },
    getImageUrl(company) {
      // Define a mapping of company names to image URLs
      const imageUrls = {
        'NextForm': 'next.png',
        'FileWizard': 'fw.png',
        'Pwnagotchi': 'pwgh.png',
        // Add more mappings as needed
      };
      return imageUrls[company];
    },
    hideImage() {
      this.image.style.opacity = 0;

        // Remove the image element after transition ends
        setTimeout(() => {
          document.body.removeChild(this.image);
          this.image = null;
          // Remove mousemove event listener when hiding the image
          document.removeEventListener('mousemove', this.updateImagePosition);
        }, 300); // Assuming the transition duration is 300ms
    },
    updateImagePosition(event) {
      // Update image position based on mouse coordinates
      const x = event.clientX;
      const y = event.clientY;
      this.image.style.left = `${x}px`;
      this.image.style.top = `${y}px`;
    }
  },
  data() {
    return {
      isActive: true,
      image: null
    };
  }
};
</script>

<style lang="css">
.image-style {
  border: 2px solid #a667f8; /* Green border */
  border-radius: 10px; /* Rounded corners */
  max-width: 400px; /* Maximum width */
  max-height: 300px; /* Maximum height */
  width: auto; /* Auto width */
  height: auto; /* Auto height */
  transition: opacity 0.3s ease-in-out; /* Transition effect for opacity */
}
</style>
