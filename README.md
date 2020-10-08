## JS Drawing Game

*Who will be the best artist?*

How about you draw some random stuff and let your friends judge you?
Sounds good, doesn't it?

That's what this game is all about. Draw with your friends, then get
judged by your other friends in this multiplayer drawing game.

New ideas are being thought for the game. It won't be distancing from
the initial idea, but the execution will probably going to get through
alterations (i.e. changes on how the players interact with the game
and with other players).

### About

This is a project for the course of Special Topics in Software
Engineering on Front-end Development Frameworks of the Federal
University of Rio Grande do Norte.

The same project will be developed using four different libraries /
frameworks. As of right now, there's only the React version of it.

| Emoji              | Meaning                                            |
|------------------- | -------------------------------------------------- |
| :construction:     | Under development                                  |
| :heavy_check_mark: | Stable, meets original idea to an acceptable level |
| :x:                | Unstable, development did not begin or complete    |

#### Development Stage

1. React :heavy_check_mark:
2. Vue :heavy_check_mark:
3. Angular :heavy_check_mark:
4. Svelte :x: :construction:

There's one extra use of a library for the multiplayer server.
If any other library show up along of the development, they'll be added
here.

* Express (for the server) :heavy_check_mark:

### Cloning this project

In order to clone this project (with its submodules), you may want to
do, in the terminal:

```sh
git clone https://github.com/murilobnt/js-drawing-game.git
cd js-drawing-game
git submodule init
git submodule update
```

PS: This is for Linux OS. If you're using Windows, you will probably
need to change `cd` to `dir`.

### User Operations v1

1\. At first, the user is prompted for their names. They can choose
if they'll have a role of player (the one who draw) or voter (the one
who evaluate the drawings).

2\. Players are redirected to a page with a drawing board and a
drawing prompt of random subjects ("Draw a smiley face",
for example). They submit the drawing when it's finished.

* 2\.1 As soon as every player finish drawing, more drawing prompts
are shown for the players. All the players share the same prompt.

* 2\.2 When every player finish every drawing, they will need to wait for
the voters to cast their votes.

3\. Voters are redirected to a waiting page, where
they wait for the drawings to get finished to cast their votes.

* 3\.1 As soon as every player finish every drawing, they are redirected
to a voting page. Every prompt will be displayed to the voters, and the
drawings will be displayed annonymously.

* 3\.2 Voters cast their votes in only one drawing for each subject.

4\. As soon as all voters vote in their favorite drawing for each
subject, the results are displayed, for the players and the voters,
in the form of a podium. The player in the first place is the one
with the most votes, overall. The game has ended.

PS: These operations are prone to slightly change over time, but only to
fit new improvements in gameplay. The idea will essentially remain the
same.

### License

JS Drawing Game and all of its submodules are licensed under the
[GNU Lesser General Public License v3.0](https://github.com/murilobnt/js-drawing-game/blob/master/LICENSE).

### Credits

This game has been developed by
[Murilo Bento](https://github.com/murilobnt).
