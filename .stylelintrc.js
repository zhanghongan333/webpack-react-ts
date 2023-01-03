module.exports = {
  extends: [
    'stylelint-config-standard', //配置styleLint扩展插件
    'stylelint-config-prettier', //配置styleLint和prettier兼容
    'stylelint-config-recess-order', //配置stylelint css属性书写顺序插件
    'stylelint-config-standard-scss' //配置stylelint scss插件
  ],
  plugins: ['stylelint-less'],
  rules: {
    'selector-class-pattern': null, //设置类名选择器不遵循kebab-case
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': null,
    'color-no-invalid-hex': true,
    'less/color-no-invalid-hex': true
  }
}
