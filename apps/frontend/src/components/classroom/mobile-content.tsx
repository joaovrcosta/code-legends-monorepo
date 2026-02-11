"use client";

export function Content() {
  return (
    <div className="lg:hidden block">
      {/* <Tabs defaultValue="account">
        <TabsList className="bg-transparent w-full h-[64px] border-b-[1px] border-[#25252A]">
          <TabsTrigger
            value="account"
            className="flex-1 h-[64px] text-[#8d8d99]"
          >
            <Info size={28} />
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="flex-1 h-[64px] text-[#8d8d99]"
          >
            <PlayCircle size={28} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className="p-4">
            <div className="flex flex-col">
              <span className="text-xs">{course.title}</span>
              <span className="bg-blue-gradient-500 bg-clip-text text-transparent text-[20px] font-bold">
                {taskData?.title}
              </span>
            </div>
            <p className="text-[14px] mt-4 max-w-[800px]">
              {taskData?.description}
            </p>
            <div className="flex items-center mt-4 space-x-3">
              <Avatar className="h-[52px] w-[52px]">
                <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?s=400&u=415dc8fde593b5dcbdef181e6186a8d80daf72fc&v=4" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-[14px]">João Victor</h3>
                <p className="text-[12px] text-[#c4c4c4]">Educator</p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="password">
          <CourseContentList course={course} pathName={pathName} />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
