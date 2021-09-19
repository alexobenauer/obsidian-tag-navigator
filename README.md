# Cross-reference Navigation plugin for Obsidian

This is a plugin for [Obsidian](https://obsidian.md/) that lets you navigate through your notes using their tags.

It's a live demonstration of a <a href="https://alexanderobenauer.com/labnotes/015/" target="_blank">concept laid out in my lab notes</a>.

For more information, see <a href="https://alexanderobenauer.com/labnotes/exp001/" target="_blank">my page on this experiment</a>, or read below.

<br />

This plugin surfaces commonly cross-referenced tags as you browse through your things, and it makes great use of nested tags (e.g. `#status/inprogress`).

[Here's a video showing it in action &raquo;](https://www.youtube.com/embed/sm5HXFNN8jE)

<br />

With the tag structure I use in my personal notes vault, this plugin effectively gives me a handful of useful interfaces. Some examples: 

- "In Progress" shows me my current workspace: all of the things I'm learning and working on right now.
- "Up Next" is filled with new and interesting things to explore.
- "Done" is a nicely organized archive.
- "Reading" brings up things I've read, things I'm in the middle of, and what I'd like to read next.
- "Writing" brings up the things I've written recently, am currently writing, and might work on next.

And of course, I can dive deeper from there: I might pull up just the things I'm reading in the topic of music, or specifically the things I'm currently writing on personal computing, or the things I'd like to read next by Doug Engelbart.

<br />

If you want to try out this plugin, be aware: It is early, so I'd recommend using it with a sample vault, such as the one I've published. It may be slow in vaults with many notes and tags, and there will be bugs!

Here's how to try it out:

1. Download and install <a href="https://obsidian.md" target="_blank">Obsidian</a>.
2. Download <a href="/assets/files/exp001/Sample_Vault.zip" target="_blank">the sample vault</a>, and open it in Obsidian: click the vault icon in the bottom left of Obsidian's window ("Open another vault"), then select the sample vault directory. Click "Turn off safe mode" if asked, and close the settings window if it's open.
3. The plugin is already included in the sample vault, but if you're using a different vault, you can download <a href="/assets/files/exp001/cross-reference-navigation.zip" target="_blank">just the plugin</a>, unzip it, and move it into your vault's `.obsidian/plugins` directory, then enable it in settings.
4. Ensure you have notes with tags.
5. Open the command palette (press CMD + P), and search for the command "Cross-reference Navigation: Open Cross-references View". Press enter when it's highlighted.

If you enjoy this experiment, you can see the rest of my work at [https://alexanderobenauer.com/](https://alexanderobenauer.com/).

---

*Credits & Acknowledgements*

The concept is based on my lab note on [Cross-references & References cloud](https://alexanderobenauer.com/labnotes/015/).

This plugin's codebase was originally based on [Obsidian Calendar Plugin](https://github.com/liamcain/obsidian-calendar-plugin).

