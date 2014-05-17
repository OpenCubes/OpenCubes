Markdown: Basics ![markdown-mark](/images/markdown-mark-66x40.png "markdown-mark")  
================

Markdown is a free and simple markup language designed for simplicity and modernity.
The syntax, unlike BBCodes or HTML, uses special character such as `*`, `_`... placed before and after the styled text.
It was first created by [Daring Fireball](http://daringfireball.net/projects/markdown/). 

## Paragraphs, Headers, Blockquotes ##

To make a paragraph - `<p>` in html - simply write down the text. A simple line break won't create a new one. To write two, separate them by 2 spaces at the end and a line break, or skip two lines.

They are two types of headers
 - using `-` or `=`: enteryour title then on the secondline make a line with `=` for main title or `-` for secondary title. For instance :

```
Second level title
------------------
```

 - using `#`. The more sharps there are before the title, the less its level is:


     # First title
     ## Second title
     #### 4th title


Blockquotes are indicated using email-style '`>`' angle brackets. Example:
```
> You shall not pass!
```
gives 
> You shall not pass!

### Phrase Emphasis ###

Markdown uses asterisks and underscores to indicate spans of emphasis.

Markdown:

    Some of these words *are emphasized*.
    Some of these words _are emphasized also_.
    
    Use two asterisks for **strong emphasis**.
    Or, if you prefer, __use two underscores instead__.

Gives:

Some of these words *are emphasized*.
Some of these words _are emphasized also_.
    
Use two asterisks for **strong emphasis**.
Or, if you prefer, __use two underscores instead__.

## Lists ##

Unordered (bulleted) lists use asterisks, pluses, and hyphens (`*`,
`+`, and `-`) as list markers. These three markers are
interchangable; this:

    *   Candy.
    *   Gum.
    *   Booze.

this:

    +   Candy.
    +   Gum.
    +   Booze.

and this:

    -   Candy.
    -   Gum.
    -   Booze.

all produce the same output:


Ordered (numbered) lists use regular numbers, followed by periods, as
list markers:

    1.  Red
    2.  Green
    3.  Blue

If you put blank lines between items, you'll get `<p>` tags for the
list item text. You can create multi-paragraph list items by indenting
the paragraphs by 4 spaces or 1 tab:

    *   A list item.
    
        With multiple paragraphs.

    *   Another item in the list.

Gives: 
 *   A list item.
    
    With multiple paragraphs.

 *   Another item in the list.


### Links ###

Markdown supports two styles for creating links: *inline* and
*reference*. With both styles, you use square brackets to delimit the
text you want to turn into a link.

Inline-style links use parentheses immediately after the link text.
For example:

    This is an [example link](http://example.com/).

Output:

This is an [example link](http://example.com/).

Optionally, you may include a title attribute in the parentheses:

    This is an [example link](http://example.com/ "With a Title").

Reference-style links allow you to refer to your links by names, which
you define elsewhere in your document:

    I get 10 times more traffic from [Google][1] than from
    [Yahoo][2] or [MSN][3].

    [1]: http://google.com/        "Google"
    [2]: http://search.yahoo.com/  "Yahoo Search"
    [3]: http://search.msn.com/    "MSN Search"

Output:

I get 10 times more traffic from [Google][1] than from
[Yahoo][2] or [MSN][3].

[1]: http://google.com/        "Google"
[2]: http://search.yahoo.com/  "Yahoo Search"
[3]: http://search.msn.com/    "MSN Search"

### Images ###

Image syntax is very much like link syntax.

Inline (titles are optional):

    ![alt text](/path/to/img.jpg "Title")

Reference-style:

    ![alt text][id]

    [id]: /path/to/img.jpg "Title"

Both of the above examples produce the same output:

    <img src="/path/to/img.jpg" alt="alt text" title="Title" />



### Code ###

To create code you can indent your code with 4 spaces or add ` ``` ` before and after. The second syntax allows you to define a language like so (do not forget a line break before):

     ```javascript
     alert('Hello, World');
     ```
or

```
     alert('Hello, World');
```



