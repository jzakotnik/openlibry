#!/usr/bin/perl

use strict;
use warnings;

# Check if two arguments are provided
die "Usage: $0 <template-file> <content-directory>\n" unless @ARGV == 2;

my ($template_file, $content_dir) = @ARGV;

# Check if the template file exists and is readable
die "Template file does not exist or cannot be read.\n" unless -f $template_file && -r $template_file;

# Check if the content directory exists and is a directory
die "Content directory does not exist or is not a directory.\n" unless -d $content_dir;

# Read the entire template file into a string
open my $template_fh, '<', $template_file or die "Cannot open template file: $!\n";
local $/; # Enable slurp mode to read the whole file at once
my $template_content = <$template_fh>;
close $template_fh;

# Process each file in the content directory
opendir my $dir, $content_dir or die "Cannot open directory: $!\n";
while (my $file = readdir($dir)) {
    next if $file =~ /^\.\.?$/; # Skip . and ..
    my $file_path = "$content_dir/$file";
    next unless -f $file_path; # Skip if not a file

    # Read file content
    open my $file_fh, '<', $file_path or die "Cannot open $file_path: $!\n";
    local $/; # Enable slurp mode
    my $file_content = <$file_fh>;
    close $file_fh;

    # Escape special characters in file content for safe replacement
    $file_content =~ s/([\$\@])/\\$1/g;

    # Replace placeholders in the template
    $template_content =~ s/\{\{\Q$file\E\}\}/$file_content/g;
}
closedir $dir;

# Output the processed template
print $template_content;
