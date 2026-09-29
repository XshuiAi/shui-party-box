# 三种样式

制作自己的游戏时，直接告诉 Skill 想用哪种样式，再说明人数、规则和操作。公共游戏页面默认紫色，不设换肤按钮。

| 紫色 | 蓝色 | 奶油橙 |
|---|---|---|
| ![紫色](screenshots/template-purple.png) | ![蓝色](screenshots/template-blue.png) | ![奶油橙](screenshots/template-orange.png) |
| [打开](https://xshuiai.github.io/shui-party-box/) | [打开](https://xshuiai.github.io/shui-party-box/templates/blue/) | [打开](https://xshuiai.github.io/shui-party-box/templates/orange/) |

## 对 Skill 这样说

> 使用蓝色模板制作我的聚会游戏。先问清人数、谁来操作、规则和结束条件，再给方案。保留配色与插画，不加手写标语或宣传口号。确认后在独立副本中实现，测试手机上的完整一轮和再玩一轮。

## 文件入口

- 紫色：index.html。
- 蓝色：templates/blue/index.html；另有 templates/blue/compact.html 简洁构图。
- 奶油橙：templates/orange/index.html；另有 templates/orange/compact.html 简洁构图。

三种样式共用现有游戏逻辑。开发全新玩法时，复用所选样式和必要组件，再实现自己的规则。
