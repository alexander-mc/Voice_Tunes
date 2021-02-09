# Voice Tunes

What would your voice sound like if it were a grand piano?

Voice Tunes records raw audio, converts the recording to MIDI, and allows users to play the file back as a grand piano. Users can also create a username to share their tunes, remove recordings and re-record, and save their work either in the app or to their computer.

This app builds off of, but is not affiliated with, [Piano Scribe](https://piano-scribe.glitch.me/), an incredible open source project that transcribes audio files in the browser using [Magenta.js](https://magenta.tensorflow.org/) and [TensorFlow.js](https://www.tensorflow.org/js/).

Want to take your tune to the next level and see what it might look like as sheet music? 

Try uploadomg your tune to [Midi Sheet Music](http://midisheetmusic.com)! You will need to download the program, but it's free, takes a minute, and is definitely worth it.

## Features

+ Create/remove a username
+ Record audio, convert to MIDI, and then play recording
+ Save MIDI in-app to play later on
+ Save MIDI to computer
+ Edit MIDI name in-app (just double-click on the name!)

## Preview

![Username Screen](/public/screenshots/01_Username.png)
![Record Screen](/public/screenshots/02_Record.png)
![Review Screen](/public/screenshots/03_Review.png)
![History - Edit Screen](/public/screenshots/04_History_Edit.png)
![History - Playback Screen](/public/screenshots/05_History_Playback.png)

## Configuration

1. Connect to a cloud storage service such as Amazon S3, Google Cloud Storage, or Microsoft Azure Storage. This app is configured to upload MIDI files to Google Cloud Storage (GCS). If you don't already have an account with a cloud storage service, you'll need to create one. All of the services previously mentioned have free or affordable options. If you opt for a service other than GCS, you'll need to modify the storage.yml file in voice-tunes-backend/config/.

     Once you have a service, create a folder called 'secrets' within voice-tunes-backend/config/. Then, place your credentials file into that directory. You should be able to generate the credentials file through your service's website. Be sure the file's path matches the path in voice-tunes-backend/config/storage.yml.  

     For more information on connecting to a cloud storage service with Active Storage, check out the documentation [here](https://guides.rubyonrails.org/active_storage_overview.html). I also found [this tutorial](https://pjbelo.medium.com/setting-up-rails-5-2-active-storage-using-google-cloud-storage-and-heroku-23df91e830f8) to be quite helpful.  

2.  Set up the database. In your console, cd into the voice-tunes-backend directory. Then run 'rake db:migrate'.

3. Run 'bundle install' to install the necessary Ruby gems and you're good to go!

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/alexander-mc/voice_tunes.git. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](contributor-covenant.org) code of conduct.