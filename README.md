[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pass-down)

<a href="https://nodei.co/npm/pass-down/"><img src="https://nodei.co/npm/pass-down.png"></a>

<img src="http://img.badgesize.io/https://unpkg.com/pass-down@0.0.9/build/ES6/pass-down.iife.js?compression=gzip">

# pass-down

The pass-down web component is an alternative web component to the [p-d.p-u package](https://www.webcomponents.org/element/p-d.p-u), which itself consists of alternative / complimentary web components to the Polymer helper elements (especially dom-bind).  The goals of pass-down are almost identical to p-d.p-u.  The difference is mostly in the semantics, and may be a matter of taste which is better.

The goal of pass-down and p-d.p-u, in a nutshell, is to be able to progressively glue DOM and custom elements together, regardless of how those elements got onto the page.  Perhaps the strongest use-case would be in a server-side generated environment, where the server creates the fundamental layout / markup, and we just need some "connectors" to allow one DOM element / custom element to talk to others.  These components should have absolutely zero impact on initial load time. OK, perhaps that's a stretch -- the browser does need to parse the components, and the components do execute some JavaScript.  But the point is, as these components get activated (asynchronously), they can remove any "disabled" attributes, so users can know when a component is ready for interaction.  

pass-down strongly encourages adhering to a downward unidirectional flow direction amongst sibling components (hence the name).  Like p-d.p-u it is a "peer-to-peer" binding framework, with no expectation of a unifying state manager.  In the declarative spirit of these components, [xtal-state](https://www.webcomponents.org/element/xtal-state) could provide local state management if needed, without having to define a formal custom element, in those (relatively rare?) cases where data doesn't cleanly flow in a single direction.  Just a suggestion.  I'm a big fan of custom elements / web components, but I also think there's a good use case for a web composition that can evolve in complexity, to the point where it is beneficial to encapsulate the logic in a web component.  But only after the benefits outweigh the (non-zero) costs.


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

## Recursive passdown

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

This is allowed:

```html
<input type="text" placeholder="Search" 
      data-on="input: pass-to:xtal-split{search.propA.propB:target.value} recursive" >
```

The syntax above will not replace the top level "search" property, it will only set el.search.propA.propB.  However, in many cases, the component needs to know that there has been an update.  If you use this syntax:

```html
<input type="text" placeholder="Search" 
      data-on="input: pass-to:xtal-split{search.propA.propB.new():target.value} recursive" >
```

then it will clone the search property after setting the property, and set xtal-split's search property to the new property.

NB:  This syntax is subject to change if some better idea comes along.

## Passing Up

The web components that inspired this one, [p-d and p-u](https://www.webcomponents.org/element/p-d.p-u), placed more emphasis on kind of "equalizing" the ability to pass down vs. pass up.  In particular, a special component, p-u was defined that allowed data to be passed up.  The only concession to preferring that things get passed down is the bad "code smell" associated with the web component whose purpose is to pass up the DOM tree.

pass-down, like p-u, does also support passing by id (which might go up), and the same caveats mentioned for p-u apply here (only reliable if passing to a previous sibling, or parent, or previous sibling of parent, etc.)

But in the case of this package this feature doesn't get its own web component, just some special syntax:

```html
<xtal-tree id="myTree"></xtal-tree>
...
<span class="expander" node="[[item]]" data-on="click: pass-to-id:myTree{toggledNode:target.node} skip-init">
  ...
</span>
```

## Rambling word salad:  Is this needed?

This web component began with the premise that passing things strictly downward, combined with a generic state management system for data that is applicable throughout the DOM tree, would be sufficient.  That premise proved wrong, at least if using xtal-state for that state management.  I would venture to say that there are some high performance scenarios, where passing data up the sibling list to a precise target out-performs any kind of generic powerful state management / binding system.  I could be wrong, who knows?  A sign that this may be right is the fact that generic state management component systems have methods called "componentshouldupdate", for example.  The ability to pass up the DOM tree to a precise target would appear to obviate the need for this kind of programmatic check, perhaps.  At least that's been my experience in one scenario.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ npm tests
```









