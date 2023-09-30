# stable-confusion-ng

single page application using web-sockets

# start flow

- enter name
    - one person chooses "host"
    - everybody else becomes "guesser"


## "host" flow
### the "prompt" screen
- enter prompt
    - generate
    - 4 pictures
    - click on one or click "generate" again

### the "reveal" screen
- next screen
    - waiting for prompts (show number of responses)
    - click "reveal"
    - show all prompts to host
    - click the winner
    - 3 seconds waiting, audio playing?
    - everybody goes back to start flow again

## "guess" flow

    - waiting for the host to send a picture generated from his prompt
    - get picture from host and write prompt
    - press submit
    - wait for the reveal,
    - show the real prompt and show the prompt which won.
        - if own prompt and the prompt which one is the same: Play fanfare