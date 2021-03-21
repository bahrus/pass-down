[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pass-down)

<a href="https://nodei.co/npm/pass-down/"><img src="https://nodei.co/npm/pass-down.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/pass-down">

pass-down (or p-d for short) is one of the key components that make up the [p-et-alia](https://github.com/bahrus/p-et-alia) "framework".  It builds on [on-to-me](https://github.com/bahrus/on-to-me).

"p-d" agrees with the [ancient](https://youtu.be/9knX6YGPtL0?t=927) wisdom "all streams flow to the sea because it is lower than they are. Humility gives it its power."

Both p-d has an attribute/property, "on" that specifies an event to monitor for.  It attaches an event listener for the specified event to the first previous element sibling without attribute "on".  You can alternatively specify the criteria for which previous element to observe, as will be discussed later.

When this event monitoring is enabled, if the previous element is disabled, the disabled attribute is removed (more on that later).

##  Downward flow amongst siblings with p-d. 

p-d  passes information from that previous sibling's event down the p-d instance's sibling list.  It stops event propagation (by default).  Sample markup is shown below: 

```html
<!--- verbose syntax -->
<div style="display:grid">
    <input>                                                                    
    <p-d on="input" to="url-builder" prop="input" val="target.value" m="1"></p-d>
    <url-builder prepend="api/allEmployees?startsWith="></url-builder>    
    <p-d on="value-changed" to="fetch-data" prop="url" val="detail.value" m="1"></p-d>
    <fetch-data></fetch-data>                                                   
    <p-d on="fetch-complete" to="my-filter" prop="input" val="detail.value" m="2"></p-d>
    <my-filter select="isActive"></my-filter>                                   
    <p-d on="value-changed"  to="#activeList" prop="items" val="detail.value" m="1"></p-d>
    <my-filter select="!isActive"></my-filter>                                  
    <p-d on="value-changed"  to="#inactiveList" prop="items" val="target.value" m="1"></p-d>
    <h3>Active</h3>
    <my-grid id="activeList"></my-grid>
    <h3>Inactive</h3>
    <my-grid id="inactiveList"><my-grid>
</div>
```

##  The anatomy of the p-d attributes / properties.

"m" is an optional attribute/property that indicates the maximum number of matching elements that are expected to be found.  If not specified, all the downstream siblings are checked, which can be wasteful.

"on" specifies the name of the event to listen for.

"to" is a CSS selector, similar to CSS selectors in a CSS file.  Only the way that selector is used is as a test on each of the next siblings after the p-d element.  The code uses the "matches" method to test each element for a match.

"prop" refers to the name of a property on the matching elements which need setting.  (An optional property/attribute, propFromEvent/prop-from-event provides a setting a dynamic property on the target elements based on a value found in the event object -- useful when using a single p-d element to handle events from multiple elements that bubble.)

"val" is a JavaScript path / expression for where to get the value used for setting.  The path is evaluated from the JavaScript event that gets fired.  For example "a.b.c" type expressions are allowed.  No ! or other JavaScript expressions is currently supported.  If the path is a single ., then it will pass the entire event object.  

If any of the sub-expressions evaluate to null or undefined, then the target element(s) aren't modified.

All the components described in this document support an attribute/property, "debug".  If the attribute is present, the code will break every time the event it is monitoring for fires.  Adding a debug attribute to a target element will also cause the processing to break every time a new value is about to be set.

Another attribute/property, "log" logs whenever the event fires.

##  But what if the way my elements should display isn't related to how data should flow?

Note that we are suggesting, in the markup above, the use of the CSS grid (display: grid).  The CSS grid allows you to specify where each element inside the CSS Grid container should be displayed.

It appears that the CSS flex/grid doesn't count elements with display:none as columns or rows.  So all the non visual components, which haven't seen the light on the benefit of setting display:none, could be marked with an attribute, nv (non visual) and apply a style for them, i.e.: 

```html
<style>
[nv]{
    display: none;
}
</style>
```

Since p-d is a non visual components, it is given display:none style by default.

Another benefit of making this explicit:  There is likely less overhead from components with display:none, as they may not get added to the [rendering tree](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#Render_tree_construction).

<details>
    <summary>
    Accessibility?
    </summary>

**NB**  This [document](https://www.filamentgroup.com/lab/accessible-responsive.html#focus) highlights the fact that there may be a growing tension between the amazing flexibility css now allows as far as layout, vs the ideal screen reader and keyboard navigation experience. I agree a browser solution seems warranted here.  But do consider this issue carefully.  Given the cycling capabilities discussed below, it should be possible to balance these concerns, generally speaking. 
</details>

## Compact notation

One can't help noticing quite a bit of redundancy in the markup above.  We can reduce this redundancy if we apply some default settings. 

1)  If no CSS specifier is defined, it will pass the properties to the next element.
2)  If no value is specified, it will try target.value.


We can also forgo quotes when not needed.

What we end up with is shown below:

```html
<!-- abbreviated syntax -->
<style>
[nv]{
    display:none;
}
</style>
<div style="display:grid">
    <input>                                                                    
    <p-d on=input prop=input></p-d>
    <url-builder prepend="api/allEmployees?startsWith=" nv></url-builder>   
    <p-d on=value-changed  prop=url></p-d>
    <fetch-data></fetch-data>                                                   
    <p-d on=fetch-complete to=my-filter prop=input m=2></p-d>
    <my-filter select=isActive nv></my-filter>                                   
    <p-d on=value-changed  to=#activeList prop=items m=1></p-d>
    <my-filter select=!isActive nv></my-filter>                                  
    <p-d on=value-changed  to=#inactiveList prop=items m=1></p-d>
    <h3>Active</h3>
    <my-grid id=activeList></my-grid>
    <h3>Inactive</h3>
    <my-grid id=inactiveList><my-grid>
</div>
```

## A spoonful of [syntactic sugar](https://www.google.com/search?q=a+spoonful+of+syntactic+sugar&rlz=1C1CHBF_enUS834US834&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjf8uuemdDiAhWKm-AKHTTwAy4Q_AUIESgC&biw=1707&bih=850)

One of the beauties of html / attributes vs JavaScript is that attributes can be defined in such a way that configuring a web component can almost read like English:

```html
<visual-ize display calendar with-time-period=year as mobius-grid with dali-esque clocks></visual-ize>
```

If the attributes need to be dynamic, it is easiest to read if the binding syntax can express those attributes directly, "pulling in" the values from somewhere:

```JavaScript
//Pseudo code
/* html */`<visual-ize display?=${showOrhide} ${directObjectType} with-${scope} 
    as ${displayType} with ${themed} ${decorationType}></visual-ize>`
```

But p-* elements, as demonstrated so far, operate more on a "push values down to specified targets when events are fired" approach, rather than "push values up to specified state (either declaratively or via event handlers), and pull values down from state declaratively into target properties." The latter approach seems more natural to read, especially as the communication appears more "mutual," and looking at either tag (source vs destination) gives a clue as to what is going on.  

We want to accomplish this with something that is actually meaningful, and that doesn't add superfluous, non verifiable syntax, while sticking to unidirectional data flow.

So we provide support for a slight variation in the syntax:

```html
<label for=lhs>LHS:</label><input id=lhs> 
<p-d on=input to=[-lhs] m=1></p-d>
<label for=rhs>RHS:</label><input id=rhs>
<p-d on=input to=[-rhs] m=1></p-d>
...
<if-diff if -lhs equals -rhs data-key-name=lhs-matches-rhs></if-diff>
...
<div data-lhs-matches-rhs="0">
    <template>

    </template>
</div>
```

What does p-d do with this syntax?

Since 

1. No "prop" attribute is found, and 
2. Since the "to" attribute follows a special pattern, where

  * the expression ends with an attribute selector, and where 
  * that attribute starts with a dash (or data-)
 
then the "prop" attribute defaults to the attribute following the first dash i.e.  "lhs" or "rhs."  lisp-case to camelCase property setting is supported.  I.e. to="[data-my-long-winded-property-name]" will set the property with name "myLongWindedPropertyName."

Furthermore, no match will be found if if-diff does not contain the -lhs (or -rhs) "pseudo" attribute.

<details>
    <summary>Setting attributes (discouraged) [TODO]</summary>
    If you want to set the attribute value, rather than the property, use the following syntax:

```html
        <button data-test="hello">Click me</button>
        <p-d on=click to=[-my-attrib] val=target.dataset.test skip-init as-attr></p-d>
        <div -my-attrib>test</div>
```

</details>

<details>
    <summary>Passing down attributes [TODO]</summary>
    The value can come from an attribute:

```html
<button aria-role="hello">Hello</button>
<p-w on="click" to=[-text-content] val=aria-role skip-init m=1></p-w>
<div -text-content></div>
```

</details>

## Viewing Your Element

To view this element locally:

1.  Install git, npm
2.  Clone or fork this git repo.
3.  Open a terminal from the folder created in step 2.
4.  Run npm install
5.  Run npm run serve
6.  Open http://localhost:3030/demo/dev

## Running Tests

```
$ npm tests
```

## Syntax

Auto-generated via [wca analyzer](https://github.com/runem/web-component-analyzer)









