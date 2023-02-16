# OLL Trainer

## https://oll-trainer-s-leirbag.vercel.app/

Used to practice Rubik's cube OLL algorithms. You select which cases to practice and time them in a randomized mode and a recap mode.

It's a near copy of https://github.com/Roman-/oll_trainer by Roman Strakhov but using React instead of pure JS. I wanted to have a manageable website I could copy using React to gain experience in React. I used lots of Roman's code, especially for the algorithms list, scramble generation, and program structure.

## To-do

- UI Customization
  - Accent color/other color customization
  - Add color customization input fields to both pages
  - Note: colors are (main text, background, links, timer, stickers, highlight case, button/hover)
  - Make button keys not jank—currently set to button color of style so component re-renders when button color changes
- Refactor/make code readable ;((((
  - Turn training elements into components not just functions
- Improve layout
  - Add button to change between recap and random mode
  - Button to reset recap mode
- Eventually change to use something like mui

## Credits

Lots of code from https://github.com/Roman-/oll_trainer by Roman Strakhov  
Based the timer code off of [Geeks for Geeks' Create a Stop Watch using ReactJS](https://www.geeksforgeeks.org/create-a-stop-watch-using-reactjs/)  
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)  
God