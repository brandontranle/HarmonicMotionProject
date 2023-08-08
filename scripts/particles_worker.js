/*window.onload = function () {
  Particles.init({
    selector: ".background",
    color: ["#DA0463", "#404B69", "#DBEDF3"],
    connectParticles: true,
    maxParticles: 100,
  });
}; */
var particlesOn = true; // Initial state: particles are on
window.onload = function () {
  particlesJS.load("particles-js", "particles.json", function () {
    console.log("particles.js loaded - callback");
  });
};
