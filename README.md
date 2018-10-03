[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pass-down)

<a href="https://nodei.co/npm/pass-down/"><img src="https://nodei.co/npm/pass-down.png"></a>

<img src="http://img.badgesize.io/https://unpkg.com/pass-down@0.0.6/build/ES6/pass-down.iife.js?compression=gzip">

# pass-down

The pass-down web component is an alternative web component to the [p-d.p-u package](https://www.webcomponents.org/element/p-d.p-u), which itself consists of alternative / complimentary web components to the Polymer helper elements (especially dom-bind).  The goals of pass-down are almost identical to p-d.p-u.  The difference is mostly in the semantics, and may be a matter of taste which is better.

The goal of pass-down and p-d.p-u, in a nutshell, is to be able to progressively glue DOM and custom elements together, regardless of how those elements got onto the page.  Perhaps the strongest use-case would be in a server-side generated environment, where the server creates the fundamental layout / markup, and we just need some "connectors" to allow one DOM element / custom element to talk to others.  These components should have absolutely zero impact on initial load time. OK, perhaps that's a stretch -- the browser does need to parse the components, and the components do execute some JavaScript.  But the point is, as these components get activated (asynchronously), they can remove any "disabled" attributes, so users can know when a component is ready for interaction.  

pass-down imposes a strict downward unidirectional flow direction amongst sibling components (hence the name).  Like p-d.p-u it is a "peer-to-peer" binding framework, with no expectation of a unifying state manager.  In the declarative spirit of these components, [xtal-state](https://www.webcomponents.org/element/xtal-state) could provide local state management if needed, without having to define a formal custom element, in those (relatively rare?) cases where data doesn't cleanly flow in a single direction.  Just a suggestion.  I'm a big fan of custom elements / web components, but I also think there's a good use case for a web composition that can evolve in complexity, to the point where it is beneficial to encapsulate the logic in a web component.  But only after the benefits outweigh the (non-zero) costs.


## Syntax
Place the component only once anywhere in your "page", and identify those regions of DOM where you want the component to allow the children to unidirectionally "socialize":

```html
<body>
  <pass-down></pass-down>
  ...
  <div data-pd>

    ...

    <xtal-fetch fetch href="https://unpkg.com/xtal-tree@0.0.22/directory.json" as="json" 
        data-on="result-changed: pass-to:xtal-tree,xtal-cascade{nodes:target.value}{2}">
    </xtal-fetch>

    ...

    <xtal-tree></xtal-tree>

    ...

    <xtal-cascade></xtal-cascade>
  </div>
```

Notes:

1)  The pass-down element itself only needs to be present once in each Shadow DOM realm.  In the example above, that realm is the top-level "outside any Shadow DOM" one.
2)  The attribute data-pd is used to indicate that that DOM element is a "pass-down region".
3)  xtal-fetch is just an example -- it could be any element.  xtal-fetch knows nothing about the "data-on" attribute.
4)  The data-on attribute is space delimited.  The first token is the event name to monitor for.  This is followed by the instruction.  Possible values are:
  a.  pass-to
  b.  pass-to-next
  c.  and-pass-to
  d.  and-pass-to-next
5)  The instruction is followed by the css selector (unless you use pass-to-next or and-pass-to-next).
6)  The selector is followed by a series of name value pairs inside braces.  The left hand side of the colon is the property name of the target element to set.  The right hand side is the path .-based accessor path from the event object, pointing to the sub property that needs to be passed to the propery name specified above.
7)  The optional second set of braces indicates how many matching elements are expected to be found.
8)  You can then add more tokens for other event names (you need a space after the closing "}").

## Recusive passdown

Normally, passing is only down down the direct siblings.  To pass things into children of siblings, indicate that the rule is recursive, and decorate the siblings with the data-pd attribute:

```html
<div data-pd>
    ...
    <input type="text" placeholder="Search" 
      data-on="input: pass-to:xtal-split{search:target.value} recursive" >
    ...
    <iron-list style="height:400px" id="nodeList" mutable-data data-pd>
      <template>
        <div class="node" style$="[[item.style]]" data-pd>
          <div class="row" data-pd>
            ...
            <span class="toggler" select-node="[[item]]" data-pd>
                <xtal-split text-content="[[item.name]]"></xtal-split>
            </span>
            ...
          </div>
        </div>
      </template>
    </iron-list>
</div>
```

## Setting Nested Properties



