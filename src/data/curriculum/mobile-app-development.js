// MOBILE APP DEVELOPMENT (Flutter) — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=92h2XcvZ-vM'; // Flutter basics
const V2 = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'; // Flutter full course 22h
const V3 = 'https://www.youtube.com/watch?v=CzRQ9mnmh44'; // Dart + Flutter complete course 20h

const R = {
  dart: { title: 'Dart language tour (official)', url: 'https://dart.dev/language', type: 'docs' },
  flutterDocs: { title: 'Flutter official docs', url: 'https://docs.flutter.dev/', type: 'docs' },
  flutterCodelabs: { title: 'Flutter codelabs — guided practice (official)', url: 'https://docs.flutter.dev/codelabs', type: 'course' },
  pubDev: { title: 'pub.dev — Flutter package registry', url: 'https://pub.dev/', type: 'docs' },
  material: { title: 'Material Design components (Google)', url: 'https://m3.material.io/', type: 'docs' },
  figma: { title: 'Figma — design the app before coding', url: 'https://www.figma.com/', type: 'tool' },
};

export default {
  slug: 'mobile-app-development',
  curriculum: [
    {
      title: 'Module 1: Dart & Environment Setup',
      lessons: [
        {
          title: 'The Mobile Landscape & Why Flutter',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.flutterDocs],
          content: `## 🎯 What you will learn
- Native vs cross-platform development
- What Flutter is and who uses it
- Setting career goals for this course

## 📖 Lesson
Building apps traditionally meant two codebases: Swift for iOS, Kotlin for Android — double the work, double the cost. **Cross-platform** frameworks let one codebase run everywhere.

**Flutter** (by Google) is today's leading choice:
- One **Dart** codebase → Android, iOS, web, desktop
- Compiles to native performance — not a website in a wrapper
- Beautiful UI out of the box (Material & Cupertino widgets)
- **Hot reload** — change code, see it instantly in the running app

Who uses it: Google (Google Pay, Google Earth), Alibaba, BMW, and thousands of startups — because small teams ship fast. In Nigeria, Flutter dominates freelance and startup hiring because one developer can serve both Android and iOS users (Android dominates locally).

**Your path in this course:** Dart basics → Flutter UI → real apps with data → state management → publishing. Ship something real by the capstone.

## 💡 Real-world example
A two-person team in Lagos built a dispatch-tracking app in Flutter in 3 months. The same scope natively would need two teams — Flutter didn't just save time, it made the startup possible.

## ✍️ Practical
1. Install Flutter SDK + Android Studio (or VS Code + emulator).
2. Run \`flutter doctor\` until all checks pass.
3. Run the starter counter app on an emulator/device.

## ✅ Checklist
- [ ] Flutter SDK installed, doctor green
- [ ] First app running on emulator
- [ ] Hot reload witnessed`,
        },
        {
          title: 'Dart 1: Variables, Types & Control Flow',
          duration: '18 min',
          videoUrl: V3,
          resources: [R.dart],
          content: `## 🎯 What you will learn
- Variables: var, final, const
- Types: String, int, double, bool, List, Map
- if/else, loops and switch

## 📖 Lesson
Dart is modern, readable and safe. Try everything on **dartpad.dev** (no install needed).

**Variables & types:**
\`\`\`dart
var name = 'Ada';        // type inferred: String
int age = 25;
double price = 99.5;
bool active = true;
final city = 'Lagos';    // assigned ONCE
const pi = 3.14159;      // compile-time constant
\`\`\`
Use \`final\` by default; reassign only when needed.

**Strings:** interpolation is everywhere: \`'Hello, \$name!'\` — cleaner than concatenation.

**Collections:** \`List<String> items = ['rice', 'beans'];\` (ordered) and \`Map<String, int> prices = {'rice': 5000};\` (key → value). These two carry most app data.

**Control flow:**
\`\`\`dart
if (age >= 18) { ... } else { ... }
for (var item in items) { print(item); }
switch (role) { case 'admin': ... }
\`\`\`
Everything you'll write in Flutter is these bricks combined. Master them here.

## 💡 Real-world example
Most early app bugs are logic bugs, not Flutter bugs: an if-condition that never fires, a list indexed wrong. Students who drill Dart basics for a week debug their apps in minutes, not hours.

## ✍️ Practical
1. Solve 10 small challenges in DartPad (calculations, string building, list filters).
2. Write a loop that prints a shopping list with prices from a Map.
3. Explain out loud why \`final\` differs from \`const\`.

## ✅ Checklist
- [ ] Variables/final/const fluent
- [ ] List + Map operations done
- [ ] if/for/switch solved exercises`,
        },
        {
          title: 'Dart 2: Functions, Classes & Null Safety',
          duration: '19 min',
          videoUrl: V3,
          resources: [R.dart],
          content: `## 🎯 What you will learn
- Functions, arrow syntax & named parameters
- Classes: fields, constructors, methods
- Null safety — Dart's superpower

## 📖 Lesson
**Functions:**
\`\`\`dart
int add(int a, int b) => a + b;                    // arrow form
void greet({required String name, int? age}) {}    // named params
\`\`\`
Flutter's widgets use named parameters constantly — get comfortable with \`{required}\` and \`?\`.

**Classes** model your app's things:
\`\`\`dart
class Product {
  final String name;
  final double price;
  Product({required this.name, required this.price});
}
\`\`\`
Constructors with \`this.field\` shorthand are everywhere in Flutter code.

**Null safety:** a variable \`String name\` can NEVER be null — the compiler stops you before runtime crashes. \`String?\` means "may be null" and forces you to handle it:
- \`name?.length\` — only if not null
- \`name ?? 'Guest'\` — fallback
- \`name!\` — you promise (avoid)

This eliminates the #1 crash category in app development. The compiler is your friend.

## 💡 Real-world example
An e-commerce app crashed for every user whose address was empty — null reaching a string method. Null-safe code with \`?? 'No address'\` would have compiled the fix into the design itself.

## ✍️ Practical
1. Write 5 functions (arrow + named params).
2. Model a Product and a User class with constructors.
3. Write 5 expressions using ?. and ??.

## ✅ Checklist
- [ ] Named parameters fluent
- [ ] Two classes built
- [ ] Null-safety operators automatic`,
        },
        {
          title: 'Flutter Setup & Your First Widget Tree',
          duration: '17 min',
          videoUrl: V1,
          resources: [R.flutterDocs, R.flutterCodelabs],
          content: `## 🎯 What you will learn
- Anatomy of a Flutter project
- StatelessWidget: UI as code
- Reading the widget tree without fear

## 📖 Lesson
**In Flutter, everything is a widget** — every button, screen, spacing and scroll area is a widget, and widgets nest into a **tree**.

Minimal app:
\`\`\`dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('My Shop')),
        body: Center(child: Text('Hello Flutter!')),
      ),
    );
  }
}
\`\`\`
Decode the tree: MaterialApp (app config) → Scaffold (page skeleton: appbar/body/floating button) → content widgets.

Project anatomy: \`lib/\` holds your Dart code (you live in **main.dart**); \`pubspec.yaml\` lists dependencies and assets (images/fonts); \`android/\`, \`ios/\` are platform shells you rarely touch early.

**Hot reload** (press r in terminal / save in VS Code) rebuilds in <1 second — experiment fearlessly; bad edits can be undone with u (hot restart) or git.

## 💡 Real-world example
New developers stare at nested parentheses, scared. After one week of tracing trees top-down — "what wraps what?" — the fear evaporates. It's just nesting, all the way down.

## ✍️ Practical
1. Run the starter app; change the AppBar title and text.
2. Add a FloatingActionButton with a placeholder action.
3. Trace the tree aloud: MaterialApp → Scaffold → …

## ✅ Checklist
- [ ] Project anatomy known
- [ ] First widget edits live
- [ ] Tree-tracing habit formed`,
        },
      ],
    },
    {
      title: 'Module 2: Building Real UIs',
      lessons: [
        {
          title: 'Layout: Row, Column & Stack',
          duration: '18 min',
          videoUrl: V1,
          resources: [R.flutterDocs, R.flutterCodelabs],
          content: `## 🎯 What you will learn
- The three layout widgets that build everything
- mainAxisAlignment vs crossAxisAlignment
- Composing complex screens from simple rows/columns

## 📖 Lesson
All Flutter layouts come from three containers:
- **Column** — stack children vertically
- **Row** — arrange children horizontally
- **Stack** — layer children on top of each other (badges over images, overlays)

Alignment control (on Row & Column):
- \`mainAxisAlignment\` — along the direction (start/center/spaceBetween…)
- \`crossAxisAlignment\` — across it
- \`Expanded\` makes a child fill remaining space; \`SizedBox(height: 16)\` is your spacer

**The composition mindset:** any screen = columns containing rows containing more columns. Before coding, sketch boxes around your design: "the screen is a Column; this card is a Row (image Column + text Column)".

Also meet **Padding** and **Container** (padding/margin/decoration/cornerRadius) — the polish tools.

## 💡 Real-world example
A student asked why her product card looked wrong — image above text instead of beside it. The sketch step revealed: she'd used Column where Row belonged. Sketch boxes first; code writes itself.

## ✍️ Practical
1. Build a profile card: avatar Row + details Column.
2. Reproduce a screenshot of any app screen with boxes-and-nesting.
3. Use Expanded, SizedBox and all three layouts.

## ✅ Checklist
- [ ] Row/Column/Stack purposes clear
- [ ] Both axis alignments used
- [ ] One real screen reproduced`,
        },
        {
          title: 'Styling: Text, Containers, Colors & Themes',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.material, R.flutterDocs],
          content: `## 🎯 What you will learn
- TextStyle, colors, fonts & spacing scale
- Theme: styling the whole app at once
- Using ThemeData for consistency

## 📖 Lesson
**TextStyle** controls typography:
\`\`\`dart
Text('₦5,000', style: TextStyle(
  fontSize: 24, fontWeight: FontWeight.bold, color: Colors.teal))
\`\`\`
Build a spacing scale (8/16/24/32) with SizedBox — consistency again is what separates professional UIs.

**Theme** is the app-wide style system — set once in MaterialApp:
\`\`\`dart
theme: ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFF0B7A55)),
  useMaterial3: true,
  textTheme: TextTheme(titleLarge: TextStyle(fontSize: 22)),
)
\`\`\`
Then widgets pull from theme: \`Theme.of(context).colorScheme.primary\` — change the seed color once, restyle the entire app.

Material 3 (Material Design's current version) gives modern defaults: tonal buttons, rounded cards, dynamic-looking surfaces. Follow m3.material.io for patterns users expect.

## 💡 Real-world example
An app with 7 different greens and 4 button styles got a 60-line ThemeData refactor — instantly unified. Theming is the highest-leverage styling skill in Flutter.

## ✍️ Practical
1. Define ThemeData with a brand color + 3 text styles.
2. Style a card using only theme values (no hardcoded colors).
3. Swap the seed color and watch the app restyle.

## ✅ Checklist
- [ ] ThemeData defined
- [ ] Widgets read from theme
- [ ] One-swap restyle proven`,
        },
        {
          title: 'ScrollView, Lists & Images',
          duration: '18 min',
          videoUrl: V2,
          resources: [R.flutterDocs, { title: 'Pexels — free images for testing', url: 'https://www.pexels.com/', type: 'resource' }],
          content: `## 🎯 What you will learn
- SingleScrollView vs ListView.builder (performance)
- Displaying network & asset images
- Building scrollable feeds like real apps

## 📖 Lesson
Apps scroll. Choose wisely:
- **SingleChildScrollView** — one long widget (short content)
- **ListView** — multiple children
- **ListView.builder** — builds items **on demand** as they scroll into view. 10,000 items? Only ~15 exist in memory. This is the right choice for any real list.

\`\`\`dart
ListView.builder(
  itemCount: products.length,
  itemBuilder: (context, i) => ProductCard(product: products[i]),
)
\`\`\`

**Images:**
- Network: \`Image.network(url)\` — add \`loadingBuilder\` for spinners, \`errorBuilder\` for failures (real networks fail!)
- Assets: declare in pubspec.yaml (\`assets: - images/\`) → \`Image.asset('images/logo.png')\`

Combine: ListView.builder + Image.network + your card widget = a real product feed. Add \`CircleAvatar\` and \`ClipRRect\` (rounded corners) for polish.

## 💡 Real-world example
An early version of a news app built all 2,000 articles with a plain ListView — it froze for 6 seconds on open. Switching to ListView.builder made it instant. Builder is not optional in production.

## ✍️ Practical
1. Build a feed of 20 items with ListView.builder.
2. Show network images with loading + error builders.
3. Add one asset image from your own images folder.

## ✅ Checklist
- [ ] ListView.builder used
- [ ] Loading/error states on images
- [ ] Asset pipeline working`,
        },
        {
          title: 'Navigation: Moving Between Screens',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.flutterDocs],
          content: `## 🎯 What you will learn
- Navigator.push / pop and the route stack
- Passing data between screens
- Named routes for real apps

## 📖 Lesson
Flutter screens are a **stack**: push a screen on top, pop to go back.

\`\`\`dart
Navigator.push(context,
  MaterialPageRoute(builder: (_) => DetailScreen(product: p)));
\`\`\`
Back button = \`Navigator.pop(context)\` (Android back does it automatically).

**Passing data:** constructor parameters — tap a product card, push DetailScreen(product: thatProduct). **Returning data:** \`final result = await Navigator.push(...)\` — the detail screen can pop with a value (e.g. "added to cart").

**Named routes** scale better:
\`\`\`dart
MaterialApp(routes: {
  '/': (_) => HomeScreen(),
  '/detail': (_) => DetailScreen(),
})
// Navigator.pushNamed(context, '/detail', arguments: p)
\`\`\`
One map, every screen addressable — deep links and tests get easier later.

## 💡 Real-world example
A shopping app's "back from detail to list" kept losing scroll position — they were rebuilding HomeScreen every pop. Keeping screens on the stack (push/pop, not replacement) preserved state for free. Understand the stack.

## ✍️ Practical
1. Wire Home → Detail with a passed object.
2. Return a value from Detail to Home via pop.
3. Convert both to named routes.

## ✅ Checklist
- [ ] push/pop with data working
- [ ] Return value received
- [ ] Named routes map in place`,
        },
      ],
    },
    {
      title: 'Module 3: State, Data & Real Apps',
      lessons: [
        {
          title: 'StatefulWidget: Making UI Respond',
          duration: '18 min',
          videoUrl: V2,
          resources: [R.flutterDocs],
          content: `## 🎯 What you will learn
- Stateless vs Stateful widgets
- setState and the rebuild cycle
- Building a working counter, toggle & cart

## 📖 Lesson
So far widgets were static (**StatelessWidget** — build once). When data CHANGES (count, toggle, cart), you need **StatefulWidget**: it holds a State object that survives rebuilds.

\`\`\`dart
class CartCounter extends StatefulWidget { ... }
class _CartCounterState extends State<CartCounter> {
  int count = 0;
  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Text('\$count'),
      onPressed: () => setState(() { count++; }),  // THE key line
    );
  }
}
\`\`\`
**setState** tells Flutter: data changed → rebuild this subtree. Everything interactive starts here.

Rules: keep state as LOW and SMALL as possible (a toggle's state lives in the toggle); never mutate without setState (UI won't know). This mental model — UI = f(state) — underpins every framework, including the advanced ones you'll meet next module.

## 💡 Real-world example
The classic bug: a list updates but the screen doesn't — the developer changed the list without setState. Debugging rule #1: if UI is stale, check whether a rebuild was requested.

## ✍️ Practical
1. Build a working cart counter (+/−).
2. Build a theme/dark-mode toggle.
3. Build a to-do list that adds items via a TextField.

## ✅ Checklist
- [ ] setState reflex built
- [ ] Counter + toggle working
- [ ] List grows from TextField`,
        },
        {
          title: 'Forms & Validation: Collecting User Input',
          duration: '17 min',
          videoUrl: V3,
          resources: [R.material, R.flutterDocs],
          content: `## 🎯 What you will learn
- TextField, controllers & Form validation
- Keyboard types, decoration & error messages
- Building a real registration form

## 📖 Lesson
Forms are where apps collect input — logins, signups, checkout.

\`\`\`dart
final emailController = TextEditingController();
Form(
  key: _formKey,
  child: TextFormField(
    controller: emailController,
    keyboardType: TextInputType.emailAddress,
    decoration: InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
    validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
  ),
)
// submit: if (_formKey.currentState!.validate()) { ... }
\`\`\`
The **validator** returns an error string or null; \`validate()\` runs them all and shows errors under fields — the UX pattern users expect.

Also: obscureText for passwords; dropdowns (DropdownButtonFormField) for fixed choices; dismiss keyboard on submit (FocusScope). On success: clear fields or navigate.

## 💡 Real-world example
A fintech signup had no validation — users typed phone numbers into the email field and support drowned in login complaints. Inline validation ("Enter a valid email") cut those tickets by 80%.

## ✍️ Practical
1. Build a signup form: name, email, phone, password.
2. Add validators for each (including phone format).
3. On valid submit, show a success SnackBar.

## ✅ Checklist
- [ ] Controllers wired
- [ ] Validators firing inline
- [ ] Success path handled`,
        },
        {
          title: 'APIs & JSON: Your App Talks to the World',
          duration: '20 min',
          videoUrl: V3,
          resources: [R.flutterDocs, R.pubDev],
          content: `## 🎯 What you will learn
- HTTP GET with the http package
- Parsing JSON into Dart models
- Loading/error states for real-world data

## 📖 Lesson
Real apps fetch data from APIs. With the \`http\` package:

\`\`\`dart
final res = await http.get(Uri.parse('https://api.example.com/products'));
if (res.statusCode == 200) {
  final list = jsonDecode(res.body) as List;
  products = list.map((j) => Product.fromJson(j)).toList();
}
\`\`\`
**Model pattern:** every JSON object gets a Dart class with \`fromJson\` — typed data everywhere, autocompleted fields, compile-time safety.

**async/await:** network calls take time — mark functions \`async\`, \`await\` the future, and keep UI responsive during the wait.

**FutureBuilder** renders the three states every data screen needs:
\`\`\`dart
FutureBuilder(future: loadProducts(), builder: (context, snap) {
  if (snap.connectionState == ConnectionState.waiting) return spinner;
  if (snap.hasError) return retryWidget;
  return ListView.builder(...);
})
\`\`\`
Practice on free APIs: JSONPlaceholder, public weather/movie APIs.

## 💡 Real-world example
A weather app crashed whenever the API was slow — it assumed instant success. Adding the loading spinner and an error screen with "Retry" turned crashes into a professional experience.

## ✍️ Practical
1. Fetch posts from JSONPlaceholder; model with fromJson.
2. Show them in a ListView.builder via FutureBuilder.
3. Handle waiting + error + retry states.

## ✅ Checklist
- [ ] GET + jsonDecode working
- [ ] fromJson model pattern used
- [ ] Loading/error/retry complete`,
        },
        {
          title: 'Local Storage: Saving Data on the Device',
          duration: '17 min',
          videoUrl: V3,
          resources: [R.pubDev, R.flutterDocs],
          content: `## 🎯 What you will learn
- shared_preferences for small data
- Persisting lists as JSON
- Designing offline-first habits

## 📖 Lesson
Users expect apps to remember: logged-in state, drafts, settings, carts.

**shared_preferences** — key/value store for small data:
\`\`\`dart
final prefs = await SharedPreferences.getInstance();
await prefs.setString('token', userToken);
await prefs.setBool('darkMode', true);
final dark = prefs.getBool('darkMode') ?? false;
\`\`\`

**Storing lists:** encode to JSON string: \`prefs.setString('todos', jsonEncode(todos))\`; decode on load. Perfect for to-do lists, recent searches, offline drafts.

**Offline-first thinking:** Nigerian networks fluctuate — apps that cache last-fetched data and sync when connected feel premium. Pattern: load cache → show instantly → fetch fresh → update UI + cache.

For heavier data (thousands of records, queries) graduate to SQLite/Drift or Firebase Firestore later — but shared_preferences covers most early needs.

## 💡 Real-world example
A market-prices app showed blank screens without network. After caching the last fetch: it opens instantly with yesterday's prices labeled "updated 18h ago" — users rated it 5 stars for "working offline".

## ✍️ Practical
1. Persist dark-mode toggle + username with prefs.
2. Save a to-do list as JSON; restore on app launch.
3. Show a "last updated" timestamp from cache.

## ✅ Checklist
- [ ] Prefs read/write fluent
- [ ] List persisted & restored
- [ ] Cache-first pattern applied`,
        },
      ],
    },
    {
      title: 'Module 4: Advanced State & Publishing',
      lessons: [
        {
          title: 'Provider: State Management That Scales',
          duration: '19 min',
          videoUrl: V2,
          resources: [R.pubDev, R.flutterDocs],
          content: `## 🎯 What you will learn
- Why setState alone doesn't scale
- ChangeNotifier + Provider pattern
- Sharing cart/auth state across screens

## 📖 Lesson
When state is needed across many screens (cart, user session), passing it through constructors collapses. **Provider** solves it: put state at the top, read it anywhere.

\`\`\`dart
class CartModel extends ChangeNotifier {
  final List<Product> items = [];
  void add(Product p) { items.add(p); notifyListeners(); }
}
// app root:
ChangeNotifierProvider(create: (_) => CartModel(), child: MyApp())
// anywhere:
final cart = context.watch<CartModel>();   // rebuilds on change
context.read<CartModel>().add(product);     // one-off action
\`\`\`
\`watch\` = rebuild me when it changes; \`read\` = just do something. This separation keeps widgets lean.

Provider is the recommended first state-management step (official Flutter guidance) — learn it before Riverpod/Bloc; the concepts transfer.

## 💡 Real-world example
A shopping app's cart badge (app bar) only updated when the cart screen was open — the cart lived inside one widget. Lifting it into a provided model made every badge, button and screen consistent instantly.

## ✍️ Practical
1. Create a CartModel; provide it at app root.
2. Add items from product cards; show count in AppBar badge.
3. Refactor your theme toggle into a provided model too.

## ✅ Checklist
- [ ] ChangeNotifier model working
- [ ] watch vs read distinguished
- [ ] Cross-screen state live`,
        },
        {
          title: 'Firebase: Auth, Firestore & Real Backends',
          duration: '21 min',
          videoUrl: V2,
          resources: [{ title: 'Firebase docs (Google)', url: 'https://firebase.google.com/docs', type: 'docs' }, R.pubDev],
          content: `## 🎯 What you will learn
- Firebase Authentication (email + Google)
- Firestore: cloud database in minutes
- Real-time reads for live features

## 📖 Lesson
**Firebase** is the fastest path from app to real backend — no server code to start:

**Auth:** \`firebase_auth\` — email/password + Google sign-in:
\`\`\`dart
await FirebaseAuth.instance.createUserWithEmailAndPassword(email: e, password: p);
final user = FirebaseAuth.instance.currentUser;
\`\`\`
Gate screens on auth state; store the uid.

**Firestore** (cloud database): documents in collections, realtime by default:
\`\`\`dart
await FirebaseFirestore.instance.collection('orders')
  .add({'userId': uid, 'total': 15000, 'createdAt': FieldValue.serverTimestamp()});

Stream<QuerySnapshot> orders = FirebaseFirestore.instance
  .collection('orders').where('userId', isEqualTo: uid).snapshots();
\`\`\`
Pair \`snapshots()\` with **StreamBuilder** → orders appear live as they're created, no refresh button.

Security: enable Firebase security rules so users read/write ONLY their own data (never leave Firestore open — real apps get abused within hours).

## 💡 Real-world example
A student's food-ordering MVP: Flutter + Firebase Auth + Firestore, live in 3 weeks, handling real orders for a campus kitchen — no backend developer hired.

## ✍️ Practical
1. Add email signup/login with firebase_auth.
2. Write a user profile doc to Firestore on signup.
3. Stream a per-user list with StreamBuilder.

## ✅ Checklist
- [ ] Auth flow working
- [ ] Firestore read + write
- [ ] Security rules scoped per user`,
        },
        {
          title: 'Polish: Themes, Icons, Splash & App Identity',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.material, R.figma],
          content: `## 🎯 What you will learn
- Complete theme + custom fonts
- Launch (splash) screens and app icons
- The polish checklist before showing anyone

## 📖 Lesson
Users judge apps in 3 seconds. Polish list:

**Identity:** design an icon (even simple bold letterform) and set it with a launcher-icon package; build a splash screen (brand color + logo) — default Flutter splash screams "template".

**Theme completion:** colorScheme from your brand seed; custom fonts via GoogleFonts package or bundled assets; consistent corner radii and elevation.

**Feel:**
- Loading states everywhere data loads (no blank screens)
- Empty states with friendly message + action ("No orders yet — browse")
- Snackbars/dialogs for actions, not silent failures
- Platform conventions: Android back button behavior, overscroll glow

**Design first:** even 30 minutes in Figma before coding saves days of UI rework — decide colors, screens and flow visually.

## 💡 Real-world example
Two identical apps functionally: one had the default Flutter icon and grey splash, the other branded launch + theme. Test users called the second "more trustworthy" — polish is perceived quality.

## ✍️ Practical
1. Set a custom launcher icon + branded splash.
2. Apply GoogleFonts typography app-wide via theme.
3. Add empty + loading states to your main screens.

## ✅ Checklist
- [ ] Icon + splash branded
- [ ] Fonts + theme consistent
- [ ] Empty/loading states everywhere`,
        },
        {
          title: 'Capstone: Build & Publish Your App',
          duration: '26 min',
          videoUrl: V2,
          resources: [R.flutterDocs, { title: 'Google Play Console', url: 'https://play.google.com/console/', type: 'resource' }],
          content: `## 🎯 What you will learn
- Building a complete app end-to-end
- Release builds and APK/AAB generation
- Publishing to Play Store & distributing

## 📖 Lesson
**Capstone brief** (choose one, build fully):
- Marketplace app: product feed, detail, cart, checkout form
- Learning app: course list, lesson reader, progress tracking
- Business app for a real local client (best option — real users!)

Architecture: screens (UI) + models + provider state + Firebase auth/data + shared prefs for caching. Apply every module: builder lists, themes, navigation, forms, validation, loading/empty/error states.

**Release build:**
\`\`\`
flutter build appbundle --release    # Android App Bundle for Play Store
flutter build apk --release          # direct-install APK (great for Nigerian users)
\`\`\`
Sign with a keystore (keep it safe — losing it means losing app updates forever).

**Publishing:** Google Play Console ($25 one-time) → upload AAB, store listing (icon, screenshots, description) → internal testing first → production. APK sharing (WhatsApp/Drive) is a valid, common distribution path locally too.

## 💡 Real-world example
A graduate built his capstone for his mother's tailoring business — booking + gallery + WhatsApp contact. It's on Play Store, and it became the portfolio piece that landed his first two freelance contracts.

## ✍️ Practical
1. Build the capstone app completely.
2. Generate signed release APK + AAB.
3. Publish (Play Store or direct APK) and get 10 real installs.

## ✅ Checklist
- [ ] Capstone feature-complete
- [ ] Signed release builds made
- [ ] App distributed to real users`,
        },
      ],
    },
  ],
};
