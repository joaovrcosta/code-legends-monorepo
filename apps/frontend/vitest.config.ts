import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'src/lib/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'src/components/classroom/lab/lab-playground/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
    environment: 'node',
  },
})
