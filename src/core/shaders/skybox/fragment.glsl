uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uTexture, vUv);

  vec3 greenColor = vec3(0.235, 0.384, 0.333);

  float strength = mod(vUv.x * 10.0, 0.5);
  vec4 finalColor = (1.0 - tex) + vec4(greenColor * strength, 1.0);

  gl_FragColor = finalColor;
}