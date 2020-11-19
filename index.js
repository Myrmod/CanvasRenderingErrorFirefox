const createThumbnailfromVideo = async () => {
  return new Promise((resolve, reject) => {
      const video = document.querySelector('video')

      if (!video) {
        reject()
      }

      video.addEventListener('loadedmetadata', async () => {
        const thumbnailInterval =  1 // 1 thumbnail per second
        const thumbnailWidth = 150
        const thumbnailHeight = 90
        const thumbnailHorizontalImageAmount = 5
        const thumbnailVerticalImageAmount = 5

        const contexts = []
        const neccessaryImages = Math.ceil(video.duration / (thumbnailHorizontalImageAmount * thumbnailVerticalImageAmount))

        for (let i = 0; i < neccessaryImages; i++) {
            const canvas = document.createElement('canvas')
            canvas.width = thumbnailHorizontalImageAmount * thumbnailWidth
            canvas.height = thumbnailVerticalImageAmount * thumbnailHeight
            const ctx = canvas.getContext('2d')

            if (!ctx) {
              return
            }

            contexts.push(ctx)

            resolve(contexts)
        }

        try {
            // here we draw the images on the canvas
            const drawImageOnSeeked = (
              context,
              currentTime,
              dx = 0,
              dy = 0,
            ) => {
              return new Promise((resolve, reject) => {
                  video.currentTime = currentTime

                  const draw = async () => {
                    // TODO: this is here because firefox doesn't render the second drawImage. Bug Report: https://bugzilla.mozilla.org/show_bug.cgi?id=1673635
                    // await new Promise(r => setTimeout(r, 100))

                    try {
                        context.drawImage(
                          video, // image source
                          dx * thumbnailWidth, // top left position of
                          dy * thumbnailHeight, // drawn thumbnail
                          thumbnailWidth, // dimensions of the
                          thumbnailHeight, // drawn thumbnail
                        )

                        video.removeEventListener('seeked', draw)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                  }
                  video.addEventListener('seeked', draw)
              })
            }

            // this recursive function triggers the drawing on the canvas
            const triggerDrawingOnCanvas = async (
              context,
              contextIndex,
              thumbnailCount = 0,
              currentTime = 0,
              dx = 0,
              dy = 0,
            ) => {
              if (
                  thumbnailCount !== thumbnailHorizontalImageAmount * thumbnailVerticalImageAmount && thumbnailCount * thumbnailInterval !== Math.floor(video.duration)
              ) {
                  if (dx >= thumbnailHorizontalImageAmount) {
                    dx = 0
                  }
                  dy = Math.floor(thumbnailCount / thumbnailHorizontalImageAmount)

                  await drawImageOnSeeked(
                    context,
                    currentTime + contextIndex * thumbnailHorizontalImageAmount * thumbnailVerticalImageAmount,
                    dx,
                    dy,
                  )
                  dx++

                  return await triggerDrawingOnCanvas(
                    context,
                    thumbnailCount + 1 > thumbnailHorizontalImageAmount * thumbnailVerticalImageAmount ? contextIndex + 1 : contextIndex,
                    thumbnailCount + 1,
                    currentTime = currentTime + thumbnailInterval,
                    dx,
                    dy,
                  )
              }
            }

            for await (const [index, context] of contexts.entries()) {
              await triggerDrawingOnCanvas(context, index)
            }
        } catch (error) {
            console.error(error)
        }
      })

      document.body.appendChild(video)
  })
}
