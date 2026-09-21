# Changing the content

You can change the menu, the opening hours and the gallery without knowing how the site
is built. Everything you can edit lives in one folder: `src/data/`. You never need to
open anything outside it.

Each file is a list. The punctuation matters more than it looks — a missing comma or
quotation mark will stop the site building — so the safest way to work is to copy a line
that already exists and change the words inside the quotation marks.

## The menu

File: `src/data/menu.ts`

One item looks like this:

```
{ name: "Flat White", price: "£3.60", amount: 3.6 },
```

- **`name`** is what the item is called.
- **`price`** is exactly what you want printed. Write it the way it should appear:
  `"£3.60"`, or `"£2.45 / £2.75"` for two sizes, or `"+£0.50"` for something added to
  another item.
- **`amount`** is the same price as a plain number, with no pound sign. Where a price
  has more than one figure, use the smallest. It is not shown to anyone; it is there so
  items can be put in price order later.

An item can also have:

```
{
  name: "Vegan Breakfast",
  price: "£12.95",
  amount: 12.95,
  description: "Two vegan sausages, avocado, two hash browns, mushroom and tomato.",
  diet: ["vegan"],
},
```

- **`description`** is the small grey text under the name. Leave the whole line out if
  there isn't one.
- **`diet`** puts a small tag after the name. Write `["vegetarian"]` for **V**,
  `["vegan"]` for **Vg**, or `["gluten-free"]` for **GF**. An item can carry more than
  one: `["vegetarian", "gluten-free"]`. Leave the whole line out if none applies.

### Gluten free — read before adding the first one

The **GF** tag exists and works, but no item carries it yet, on purpose. A wrong
gluten-free label can make someone with coeliac disease ill, and whether a dish is
gluten free depends on how the kitchen prepares it and what else touches the same
surfaces — not on the ingredient list alone.

So the rule is: **the list of gluten-free items comes from the kitchen, in writing.** Do
not add the tag to an item because it looks as though it should be gluten free, because
a similar item elsewhere is, or because a customer said so. When the kitchen's written
list arrives, add `"gluten-free"` to exactly the items on it and nothing else, and keep
the list with the change so it is clear where the labels came from.

### To change a price

Find the item and change both `price` and `amount`. They must agree.

### To add an item

Copy a whole line from `{` to `},` including the comma, paste it underneath, and change
the words. Items appear in the order they are written.

### To remove an item

Delete the whole line, from `{` to the comma at the end.

### The bits around the items

- **`title`** is a heading such as "Breakfast & Brunch" or "Sides".
- **`hint`** is the small text beside a heading, such as the per-scoop gelato prices.
- **`fineprint`** is the small note under a list, such as "Alt milk +30p".
- **`column: 1`** or **`column: 2`** decides which of the two columns a group sits in.
- **`feature`** is the boxed item at the bottom of the breakfast tab.

## The opening hours

File: `src/data/openingHours.ts`

```
{ day: 1, label: "Monday", opens: hm(8, 0), closes: hm(17, 0), kitchenCloses },
```

`hm(8, 0)` means eight o'clock; `hm(17, 30)` would mean half past five in the afternoon.
Use the 24-hour clock. Do not change `day` or the order of the lines.

`kitchenCloses` is when the kitchen stops serving food; the café stays open until
`closes`. It is set per day: 16:00 Monday to Friday and 15:00 on Saturday and Sunday, as
the café confirmed. The menu note above the menu, the "open now" line and the last
bookable time all follow it, so a change here changes all three.

Changing a time here changes it in every place at once: the table on the page, the "open
now" line at the top, the "served all day till" note above the menu, the times the booking
form offers, and the information search engines read. They cannot disagree with each
other.

## The gallery

File: `src/data/gallery.ts`

```
{ src: imgGallery04, alt: "Pinsa topped with Parma ham and rocket", caption: "Pinsa" },
```

- **`alt`** describes the photograph for someone who cannot see it, and for search
  engines. Write what is in the picture, not "photo" or "image".
- **`caption`** is the text shown over the photograph.
- **`variant: "tall"`** or **`variant: "wide"`** makes a photograph take up more room in
  the grid. Leave it out for a normal square.

To add a photograph, put the file in `public/images/`, then add a line at the top of the
file that reads it, copying one of the existing lines and changing the file name. Then
run `npm run images:formats`, which writes the smaller and lighter copies the site serves
(it only writes what is missing), and commit those files with the photograph.

## Telephone, address and links

File: `src/data/site.ts`

The business name, address, telephone number and the Instagram, Facebook, Tripadvisor,
Deliveroo and Just Eat links are all here, each written once. Changing the telephone
number here changes it everywhere it appears.

## Checking your change

Ask a developer to run the site, or if you are comfortable at a terminal:

```bash
npm run dev
```

and open the address it prints. If the page does not load, the message usually names the
file and the line, and it is almost always a missing comma or quotation mark.
