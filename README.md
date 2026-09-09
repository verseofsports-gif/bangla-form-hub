# Bangla Form Hub

Build a responsive Bengali-language form website based closely on the attached reference screenshot.

IMPORTANT:

- Do NOT create the navigation/menu bar shown in the reference.

- Do NOT create unnecessary website pages.

- The main purpose of the website is the form.

- The form must work fully, not just be a visual mockup.

- I am using the FREE Lovable plan, so prioritize free-compatible features and avoid paid integrations.

========================================

PAGE DESIGN

========================================

Create a single-page Bengali form.

Overall appearance should closely resemble the reference image:

- Light warm-gray/off-white page background

- Centered content area

- Traditional Bengali website aesthetic

- Simple, clean and lightweight

- No modern oversized cards

- No excessive shadows

- No gradients

- No unnecessary animations

Desktop:

- Form/content area approximately 900–1000px wide

- Two-column layout near the top:

  LEFT = explanatory Bengali text

  RIGHT = form fields

Mobile:

- Convert to a single-column layout

- Explanation first

- Form underneath

- Inputs should occupy almost the full available width

- No horizontal scrolling

========================================

HEADER

========================================

Do NOT include the original site's navigation menus.

Create only a simple header area if needed:

- Logo on the left

- Website/organization title beside the logo

- Optional small contact/social area on the right

Keep the header minimal.

Do NOT add:

- Navigation menu

- Dropdown menus

- Home/About/Contact links

- Large hero section

- Slider

- Advertisement

The form should start shortly below the header.

========================================

FORM TITLE

========================================

At the top center:

"সমর্থক ফরম"

Use an elegant Bengali serif-style font.

The title should be approximately 24–30px on desktop and responsive on mobile.

========================================

LEFT INFORMATION SECTION

========================================

Create a narrow text section on the left similar to the screenshot.

Use Bengali explanatory text explaining that the visitor can submit their information through the form.

Keep the typography compact:

- Bengali text

- Approximately 14–16px

- Comfortable line height

- Dark gray text

- Left aligned

Do not make this section visually dominant.

========================================

RIGHT FORM

========================================

Create a vertical form matching the reference screenshot.

Use:

- Bengali field labels

- Red * for required fields

- White/light input backgrounds

- Thin borders

- Approximately 38–42px input height

- Small spacing between fields

- Labels above inputs

Example structure:

নাম *

[ input ]

ঠিকানা

[ input ]

ফোন নম্বর *

[ input ]

ই-মেইল *

[ input ]

জাতীয়তা

[ input ]

জন্মতারিখ

[ input ]

মোবাইল নম্বর *

[ input ]

WhatsApp নম্বর

[ input ]

পেশা/পরিচয়

[ input ]

========================================

ADDITIONAL INFORMATION SECTION

========================================

Create a visually separated section similar to the bordered box in the reference.

Inside it include appropriate general-purpose fields such as:

বর্তমান ঠিকানা

[ input ]

স্থায়ী ঠিকানা

[ input ]

বিভাগ *

[ select ]

Then:

[ ] Same as previous

If "Same as previous" is checked, automatically copy the relevant address information.

========================================

MORE FORM FIELDS

========================================

Add:

অতিরিক্ত তথ্য

[ textarea ]

আপনার মন্তব্য/বার্তা

[ textarea ]

Additional preference/category fields may use dropdowns where appropriate.

Dropdown default:

"select"

Use Bengali labels.

========================================

CONSENT

========================================

At the bottom add a clear consent checkbox:

[ ] আমি উপরের তথ্য সঠিকভাবে প্রদান করেছি এবং ফর্মটি জমা দিতে সম্মত।

The checkbox must be required before submission.

========================================

SUBMIT BUTTON

========================================

Create a rectangular blue submit button similar to the screenshot.

Button text:

"জমা দিন"

Style:

- Blue background

- White Bengali text

- Approximately 105–120px wide

- 38–42px high

- No excessive rounded corners

- Hover effect

- Disabled/loading state

When clicked:

"জমা হচ্ছে..."

After successful submission:

"আপনার তথ্য সফলভাবে জমা হয়েছে।"

Do not allow accidental double submission.

========================================

BACKEND

========================================

Connect the form to a database using Lovable's free-compatible backend capabilities.

Create a submissions table containing only the fields actually used by the form.

Suggested structure:

id

name

phone

email

address

profession

additional_information

consent

created_at

Use proper validation.

Public visitors:

- Can submit

- Cannot view other submissions

Admin:

- Can securely view submissions

- Can search submissions

- Can filter by date

- Can delete submissions

- Can export submissions

Never expose database credentials in frontend code.

========================================

ADMIN DASHBOARD

========================================

Create a protected admin dashboard at:

/admin

Admin dashboard should NOT be visible to normal visitors.

Dashboard:

--------------------------------

Total Submissions

Today's Submissions

This Week

This Month

--------------------------------

Then a submissions table:

ID | Name | Phone | Email | Date | Actions

Features:

- Search

- Date filter

- Pagination

- View details

- Delete

- Export Excel

========================================

EXCEL EXPORT

========================================

Add:

"Excel ডাউনলোড"

button.

When clicked, generate and download:

.xlsx

Filename:

submissions-YYYY-MM-DD.xlsx

The Excel file must:

- Preserve Bengali Unicode correctly

- Have readable column headers

- Include submission date/time

- Export all records

- Support exporting filtered records if practical

Do not require Google Sheets or another paid external service.

Prefer a free/open-source Excel generation library that works with the project's existing stack.

========================================

SECURITY

========================================

Implement proper access control.

IMPORTANT:

- Public users can INSERT submissions only.

- Public users cannot SELECT/read submissions.

- Public users cannot DELETE submissions.

- Only authenticated admins can access /admin.

- Only admins can export data.

- Only admins can delete data.

- Validate all submitted fields.

- Protect against SQL injection/XSS.

- Never put admin credentials in frontend code.

========================================

RESPONSIVE DESIGN

========================================

Desktop layout:

        FORM TITLE

LEFT INFORMATION       RIGHT FORM

----------------       ----------------

Bengali text           Name

                       Phone

                       Email

                       Address

                       ...

                       Submit

Mobile layout:

FORM TITLE

Bengali information

Name

[input]

Phone

[input]

Email

[input]

Address

[input]

...

[জমা দিন]

========================================

VISUAL MATCH

========================================

Use the attached screenshot as the visual reference.

Match:

- General proportions

- Background tone

- Form width

- Typography hierarchy

- Field spacing

- Label positioning

- Input sizing

- Blue submit button

- Two-column desktop arrangement

- Simple Bengali government/organization-style form appearance

BUT:

- Remove ALL navigation menus.

- Remove unnecessary pages.

- Do not copy unrelated content.

- Do not copy third-party branding/assets.

- Keep the implementation original while following the visual layout.

========================================

FREE LOVABLE REQUIREMENT

========================================

Because I am using Lovable FREE:

1. Do not add paid APIs.

2. Do not add paid authentication providers unnecessarily.

3. Do not add paid email/SMS services.

4. Do not add unnecessary external integrations.

5. Use the simplest free-compatible database/backend approach.

6. Use client-side Excel generation if that avoids requiring a paid backend service.

7. Keep the project lightweight.

========================================

FINAL TEST

========================================

Before completing the implementation, verify:

✓ Form works

✓ Required-field validation works

✓ Bengali text works correctly

✓ Mobile layout works

✓ Submission reaches the database

✓ Duplicate submission is prevented

✓ Admin authentication works

✓ Admin can see submissions

✓ Search works

✓ Date filtering works

✓ Delete works

✓ Excel export works

✓ Bengali characters remain correct in Excel

✓ Public users cannot access submission data

✓ No navigation menu appears

✓ No horizontal scrolling on mobile

Do not stop at designing the frontend. Implement the complete working form + backend + protected admin dashboard + Excel export using free-compatible technologies.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5265c7df-1837-477a-8a9c-29a85e7f7482).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
